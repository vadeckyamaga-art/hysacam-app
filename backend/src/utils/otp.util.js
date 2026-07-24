const bcrypt = require("bcrypt");
const crypto = require("crypto");

const HASH_ROUNDS = 10;

function generateOtpCode() {
  const length = Number(process.env.OTP_LENGTH || 6);
  const max = 10 ** length;
  // crypto.randomInt évite les biais de Math.random() pour un code sensible
  const code = crypto.randomInt(0, max).toString().padStart(length, "0");
  return code;
}

function hashOtp(code) {
  return bcrypt.hash(code, HASH_ROUNDS);
}

function compareOtp(code, hash) {
  return bcrypt.compare(code, hash);
}

function getExpiryDate() {
  const minutes = Number(process.env.OTP_EXPIRES_MINUTES || 5);
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = { generateOtpCode, hashOtp, compareOtp, getExpiryDate };
