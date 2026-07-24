// Formats acceptés en entrée : 6XXXXXXXX, 237 6XXXXXXXX, +237 6XXXXXXXX
// Toujours normalisé et stocké au format E.164 : +2376XXXXXXXX
const CAMEROON_MOBILE_REGEX = /^(?:\+?237)?6[0-9]{8}$/;

function isValidCameroonianPhone(rawPhone) {
  const cleaned = rawPhone.replace(/[\s.-]/g, "");
  return CAMEROON_MOBILE_REGEX.test(cleaned);
}

function normalizePhone(rawPhone) {
  const cleaned = rawPhone.replace(/[\s.-]/g, "");
  const digitsOnly = cleaned.replace(/^\+?237/, "");
  return `+237${digitsOnly}`;
}

module.exports = { isValidCameroonianPhone, normalizePhone };
