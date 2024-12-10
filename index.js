import express from 'express';
import dotenv from 'dotenv';
import { validateEnv } from './utils/validateEnv.js'; // Si tu as des variables d'env à valider
import { authenticateToken } from './middleware/authMiddleware.js'; // Middleware d'authentification
import authRoutes from './routes/authRoutes.js';
import firestoreRoutes from './routes/firestoreRoutes.js';
import { httpRequestsTotal, httpRequestDurationSeconds } from './metrics.js';
import client from 'prom-client'; // Client Prometheus

// Charger les variables d'environnement
dotenv.config();

// Valider les variables d'environnement
validateEnv();

// Créer l'application Express
const app = express();
app.use(express.json());

// Middleware pour suivre les requêtes HTTP
app.use((req, res, next) => {
  const route = req.route ? req.route.path : req.url;
  const start = Date.now();

  res.on('finish', () => {
    // Incrémenter le compteur pour chaque requête
    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status: res.statusCode,
    });

    // Mesurer la durée de la requête
    const duration = (Date.now() - start) / 1000; // Durée en secondes
    httpRequestDurationSeconds.observe({
      method: req.method,
      route: route,
    }, duration);
  });

  next();
});

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

// Route pour exposer les métriques à Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Démarrer le serveur
const port = parseInt(process.env.PORT, 10);
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
