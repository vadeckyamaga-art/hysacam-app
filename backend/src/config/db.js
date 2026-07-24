const { Pool } = require("pg");

// Champs séparés plutôt qu'une URL unique : évite les soucis d'encodage
// si le mot de passe contient des caractères spéciaux (@, #, /, etc.).
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || "postgres",
  password: String(process.env.PGPASSWORD ?? ""),
  database: process.env.PGDATABASE || "hysacam",
});

if (!process.env.PGPASSWORD) {
  console.warn(
    "⚠️  PGPASSWORD n'est pas défini dans le fichier .env — vérifiez qu'il existe bien " +
    "(pas .env.txt) et qu'il contient une ligne PGPASSWORD=..."
  );
}

pool.on("error", (err) => {
  // Erreur sur une connexion inactive du pool — à logger, ne doit jamais faire planter le process
  console.error("Erreur inattendue sur le pool PostgreSQL", err);
});

module.exports = pool;
