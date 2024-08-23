// index.js

import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import firestoreRoutes from './routes/firestoreRoutes.js'; // Importer les routes Firestore
import { validateEnv } from './utils/validateEnv.js';

// Charger les variables d'environnement
dotenv.config();

// Valider les variables d'environnement
validateEnv();

const app = express();
app.use(express.json());

// Définir les routes
app.use('/api/auth', authRoutes);
app.use('/api/firestore', firestoreRoutes); // Ajouter les routes Firestore

// Route de base
app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

// Utiliser le port défini dans .env ou un port par défaut si non défini
const port = parseInt(process.env.PORT, 10) || 3001;

// Démarrer le serveur
app.listen(port, (err) => {
  if (err) {
    console.error(`Error occurred while trying to listen on port ${port}:`, err);
    process.exit(1); // Arrêter l'application en cas d'erreur
  }
  console.log(`Listening on port ${port}`);
});
