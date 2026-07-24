const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { otpRequestLimiter, otpVerifyLimiter } = require("../middleware/rateLimiter.middleware");

// Écran 1 — Connexion / Inscription
router.post("/request-otp", otpRequestLimiter, authController.requestOtp);
router.post("/verify-otp", otpVerifyLimiter, authController.verifyOtp);

// Utilisé par le frontend au démarrage pour vérifier la session et récupérer le profil
router.get("/me", requireAuth, authController.me);

module.exports = router;
