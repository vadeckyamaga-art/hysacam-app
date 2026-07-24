import { useEffect, useRef, useState } from "react";
import { requestOtp, verifyOtp } from "../../services/auth.service";

const CAMEROON_PHONE_REGEX = /^(?:\+?237)?6[0-9]{8}$/;
const RESEND_DELAY_SECONDS = 60;

/**
 * Écran 1 — Connexion / Inscription.
 * Deux étapes : saisie du téléphone → saisie du code OTP (+ nom/ville si nouvel utilisateur).
 */
export default function LoginScreen({ onAuthenticated }) {
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === "otp") otpInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  async function handleSendCode(e) {
    e.preventDefault();
    setError("");

    if (!CAMEROON_PHONE_REGEX.test(phone.replace(/[\s.-]/g, ""))) {
      setError("Entrez un numéro camerounais valide (ex. 6XX XX XX XX).");
      return;
    }

    setLoading(true);
    try {
      const res = await requestOtp(phone);
      setIsNewUser(Boolean(res.isNewUser));
      setStep("otp");
      setResendIn(RESEND_DELAY_SECONDS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError("");

    if (code.length < 4) {
      setError("Entrez le code reçu par SMS.");
      return;
    }
    if (isNewUser && (!name.trim() || !city.trim())) {
      setError("Nom complet et ville requis pour finaliser l'inscription.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ phone, code, name, city });
      onAuthenticated(res.token, res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendIn > 0) return;
    setError("");
    setLoading(true);
    try {
      await requestOtp(phone);
      setResendIn(RESEND_DELAY_SECONDS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-hysacam-paper px-6 pt-14">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-hysacam-red">
          <span className="text-white font-display font-extrabold text-xl">H</span>
        </div>
        <h1 className="font-display text-[19px] font-extrabold text-center leading-tight text-hysacam-ink">
          Ensemble pour un
          <br />
          Cameroun propre
        </h1>
      </div>

      {error && (
        <div className="mb-4 rounded-xl px-3.5 py-2.5 bg-red-50 border border-red-200">
          <p className="text-[12px] font-display text-hysacam-red">{error}</p>
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-3">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wide text-gray-500">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="6XX XX XX XX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl px-4 py-3 text-[14px] font-mono border border-hysacam-line focus:border-hysacam-red focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-xl py-3.5 text-white text-[14px] font-display font-bold bg-hysacam-red disabled:opacity-60"
          >
            {loading ? "Envoi en cours..." : "Recevoir un code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wide text-gray-500">
            Code reçu par SMS
          </label>
          <input
            ref={otpInputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="rounded-xl px-4 py-3 text-[18px] font-mono tracking-[0.3em] text-center border border-hysacam-green focus:outline-none"
          />

          {isNewUser && (
            <>
              <label className="text-[11px] font-mono font-bold uppercase tracking-wide text-gray-500 mt-2">
                Nom complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl px-4 py-3 text-[14px] font-display border border-hysacam-line focus:border-hysacam-green focus:outline-none"
              />
              <label className="text-[11px] font-mono font-bold uppercase tracking-wide text-gray-500 mt-2">
                Ville de résidence
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl px-4 py-3 text-[14px] font-display border border-hysacam-line focus:border-hysacam-green focus:outline-none"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-xl py-3.5 text-white text-[14px] font-display font-bold bg-hysacam-green disabled:opacity-60"
          >
            {loading ? "Vérification..." : "Valider"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendIn > 0 || loading}
            className="text-[11px] font-mono text-center mt-1 text-gray-500 disabled:opacity-60"
          >
            {resendIn > 0 ? `Renvoyer le code dans 00:${String(resendIn).padStart(2, "0")}` : "Renvoyer le code"}
          </button>
        </form>
      )}
    </div>
  );
}
