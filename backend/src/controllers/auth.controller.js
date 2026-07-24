const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const { sendSms } = require("../services/sms.service");
const { isValidCameroonianPhone, normalizePhone } = require("../utils/phone.util");
const { generateOtpCode, hashOtp, compareOtp, getExpiryDate } = require("../utils/otp.util");
const { signToken } = require("../utils/jwt.util");

const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

/**
 * POST /api/auth/request-otp
 * Body: { phone }
 * Crée l'utilisateur s'il n'existe pas encore, génère un OTP, l'envoie par SMS.
 * Ne révèle jamais si le numéro existait déjà (évite l'énumération de comptes).
 */
async function requestOtp(req, res) {
  const { phone: rawPhone } = req.body;

  if (!rawPhone || !isValidCameroonianPhone(rawPhone)) {
    return res.status(400).json({ error: "Numéro de téléphone camerounais invalide." });
  }

  const phone = normalizePhone(rawPhone);

  try {
    let user = await userModel.findByPhone(phone);
    if (!user) {
      user = await userModel.create({ phone });
    }

    // Un seul OTP actif à la fois par utilisateur
    await otpModel.invalidatePending(user.id);

    const code = generateOtpCode();
    const codeHash = await hashOtp(code);
    const expiresAt = getExpiryDate();

    await otpModel.create({ userId: user.id, codeHash, expiresAt });
    await sendSms(phone, `Votre code HYSACAM : ${code}. Il expire dans ${process.env.OTP_EXPIRES_MINUTES || 5} minutes.`);

    return res.status(200).json({
      message: "Code envoyé par SMS.",
      isNewUser: !user.name, // le frontend affiche les champs Nom/Ville si true
    });
  } catch (err) {
    console.error("Erreur requestOtp:", err);
    return res.status(500).json({ error: "Impossible d'envoyer le code pour le moment." });
  }
}

/**
 * POST /api/auth/verify-otp
 * Body: { phone, code, name?, city? }
 * Vérifie le code, complète le profil si nouvel utilisateur, renvoie un JWT.
 */
async function verifyOtp(req, res) {
  const { phone: rawPhone, code, name, city } = req.body;

  if (!rawPhone || !code) {
    return res.status(400).json({ error: "Téléphone et code requis." });
  }

  const phone = normalizePhone(rawPhone);

  try {
    const user = await userModel.findByPhone(phone);
    if (!user) {
      return res.status(400).json({ error: "Code invalide ou expiré." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Ce compte est suspendu. Contactez le support HYSACAM." });
    }

    const otp = await otpModel.findLatestActive(user.id);
    if (!otp) {
      return res.status(400).json({ error: "Code invalide ou expiré." });
    }

    if (new Date(otp.expires_at) < new Date()) {
      return res.status(400).json({ error: "Code expiré. Demandez-en un nouveau." });
    }

    if (otp.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: "Trop de tentatives. Demandez un nouveau code." });
    }

    const isMatch = await compareOtp(code, otp.code_hash);
    if (!isMatch) {
      await otpModel.incrementAttempts(otp.id);
      return res.status(400).json({ error: "Code incorrect." });
    }

    await otpModel.markConsumed(otp.id);

    // Nouvel utilisateur : le nom/la ville doivent être fournis à cette étape
    let finalUser = user;
    if (!user.name) {
      if (!name || !city) {
        return res.status(400).json({ error: "Nom complet et ville requis pour finaliser l'inscription." });
      }
      finalUser = await userModel.completeProfile(user.id, { name, city });
    }

    const token = signToken(finalUser);

    return res.status(200).json({
      token,
      user: {
        id: finalUser.id,
        phone: finalUser.phone,
        name: finalUser.name,
        city: finalUser.city,
        role: finalUser.role,
      },
    });
  } catch (err) {
    console.error("Erreur verifyOtp:", err);
    return res.status(500).json({ error: "Impossible de vérifier le code pour le moment." });
  }
}

/**
 * GET /api/auth/me
 * Retourne le profil de l'utilisateur authentifié (via requireAuth).
 */
async function me(req, res) {
  try {
    const user = await userModel.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error("Erreur me:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

module.exports = { requestOtp, verifyOtp, me };
