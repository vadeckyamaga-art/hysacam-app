import apiFetch from "./api";

/** Écran 1 — étape 1 : demande d'un code OTP par SMS */
export function requestOtp(phone) {
  return apiFetch("/auth/request-otp", { method: "POST", body: { phone } });
}

/** Écran 1 — étape 2 : vérification du code, complète le profil si nouvel utilisateur */
export function verifyOtp({ phone, code, name, city }) {
  return apiFetch("/auth/verify-otp", { method: "POST", body: { phone, code, name, city } });
}

export function fetchMe(token) {
  return apiFetch("/auth/me", { token });
}
