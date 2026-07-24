const rateLimit = require("express-rate-limit");

/**
 * Limite les demandes d'OTP par IP : évite qu'un script envoie des centaines
 * de SMS (coût direct + risque d'abus). À combiner avec le compteur
 * "attempts" par utilisateur (voir otp.model.js) qui protège en plus contre
 * le brute-force du code lui-même.
 */
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 demandes d'OTP par IP sur la fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Trop de demandes de code. Réessayez dans quelques minutes.",
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // un peu plus permissif que la demande, car les fautes de frappe arrivent
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Trop de tentatives de vérification. Réessayez plus tard.",
  },
});

module.exports = { otpRequestLimiter, otpVerifyLimiter };
