require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(helmet());
app.use(cors()); // à restreindre à l'origine du frontend en production
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);

// Les autres routes (reports, depots, collectionPoints, citizens, notifications)
// seront ajoutées ici au fur et à mesure, chacune dans son propre fichier
// sous src/routes/, en suivant le même schéma que auth.routes.js.

// Gestionnaire d'erreurs générique — filet de sécurité, ne doit jamais fuiter la stack en prod
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API HYSACAM démarrée sur le port ${PORT}`);
});

module.exports = app;
