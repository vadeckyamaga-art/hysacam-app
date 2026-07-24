const pool = require("../config/db");

/**
 * Invalide tous les OTP non consommés d'un utilisateur avant d'en émettre un nouveau.
 * Évite qu'un ancien code traîne encore comme valide.
 */
async function invalidatePending(userId) {
  await pool.query(
    `UPDATE otp_codes SET consumed = true
     WHERE user_id = $1 AND consumed = false`,
    [userId]
  );
}

async function create({ userId, codeHash, expiresAt }) {
  const { rows } = await pool.query(
    `INSERT INTO otp_codes (user_id, code_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, expires_at, attempts, consumed, created_at`,
    [userId, codeHash, expiresAt]
  );
  return rows[0];
}

/**
 * Récupère le dernier OTP actif (non consommé) d'un utilisateur.
 */
async function findLatestActive(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM otp_codes
     WHERE user_id = $1 AND consumed = false
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function incrementAttempts(id) {
  const { rows } = await pool.query(
    `UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1 RETURNING attempts`,
    [id]
  );
  return rows[0]?.attempts;
}

async function markConsumed(id) {
  await pool.query(`UPDATE otp_codes SET consumed = true WHERE id = $1`, [id]);
}

module.exports = { invalidatePending, create, findLatestActive, incrementAttempts, markConsumed };
