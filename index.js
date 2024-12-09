// index.js

import express from 'express';
import dotenv from 'dotenv';
import { validateEnv } from './utils/validateEnv.js'; // Si tu as des variables d'env à valider
import { authenticateToken } from './middleware/authMiddleware.js'; // Middleware d'authentification
import authRoutes from './routes/authRoutes.js';
import firestoreRoutes from './routes/firestoreRoutes.js';
import { initPrometheus } from './metrics/prometheus.js'; // Importer la fonction de métriques Prometheus

// Charger les variables d'environnement
dotenv.config();

// Valider les variables d'environnement
validateEnv();

// Créer l'application Express
const app = express();
app.use(express.json());

// Initialiser les métriques Prometheus
initPrometheus(app);

// Route de base
app.get('/', (req, res) => {
  const name = process.env.NAME || '?';
  res.send(`What are you doing here ${name}!`);
});

// Middleware d'authentification pour certaines routes
app.use('/api/auth/updateUser', authenticateToken);

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/firestore', firestoreRoutes);

// Démarrer le serveur
const port = parseInt(process.env.PORT, 10) || 3001;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
