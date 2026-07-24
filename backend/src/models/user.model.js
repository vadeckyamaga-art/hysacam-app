const pool = require("../config/db");

/**
 * Recherche un utilisateur par numéro de téléphone.
 * @param {string} phone - format E.164, ex. +237600000000
 */
async function findByPhone(phone) {
  const { rows } = await pool.query(
    `SELECT id, phone, name, city, role, status, created_at
     FROM users WHERE phone = $1`,
    [phone]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, phone, name, city, role, status, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Crée un utilisateur "coquille vide" dès la demande d'OTP.
 * Le nom et la ville seront complétés à la vérification si nouvel utilisateur.
 */
async function create({ phone }) {
  const { rows } = await pool.query(
    `INSERT INTO users (phone) VALUES ($1)
     RETURNING id, phone, name, city, role, status, created_at`,
    [phone]
  );
  return rows[0];
}

/**
 * Complète le profil d'un utilisateur nouvellement inscrit
 * (appelé uniquement si name/city ne sont pas encore renseignés).
 */
async function completeProfile(id, { name, city }) {
  const { rows } = await pool.query(
    `UPDATE users SET name = $2, city = $3
     WHERE id = $1
     RETURNING id, phone, name, city, role, status, created_at`,
    [id, name, city]
  );
  return rows[0];
}

module.exports = { findByPhone, findById, create, completeProfile };
