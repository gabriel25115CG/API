import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Importer le package CORS
import { validateEnv } from './utils/validateEnv.js'; // Si tu as des variables d'env à valider
import { authenticateToken } from './middleware/authMiddleware.js'; // Middleware d'authentification
import authRoutes from './routes/authRoutes.js';
import firestoreRoutes from './routes/firestoreRoutes.js';
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
  httpRequestsByStatus,
  updateAvgResponseTime
} from './metrics.js'; // Importer les métriques
import client from 'prom-client'; // Client Prometheus
import winston from 'winston'; // Importer Winston

// Charger les variables d'environnement
dotenv.config();

// Valider les variables d'environnement
validateEnv();

// Configuration du logger avec Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'api_logs.log' })
  ],
});

// Créer l'application Express
const app = express();
app.use(express.json());

// Configurer CORS pour autoriser toutes les origines
const corsOptions = {
  origin: '*',  // Permet toutes les origines
  methods: 'GET,POST,PUT,PATCH,DELETE',  // Méthodes autorisées
  allowedHeaders: 'Content-Type, Authorization',  // En-têtes autorisés
};
app.use(cors(corsOptions));  // Appliquer CORS à toutes les routes

// Middleware pour logger chaque requête et suivre les métriques
app.use((req, res, next) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();

  // Log l'appel d'API avec Winston
  logger.info(`API Request: ${method} ${url} at ${timestamp}`);

  const route = req.route ? req.route.path : req.url;
  const start = Date.now();

  res.on('finish', () => {
    // Incrémenter le compteur pour chaque requête HTTP
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

    // Mettre à jour la durée moyenne des requêtes
    updateAvgResponseTime(duration);

    // Suivre les statuts des réponses HTTP
    httpRequestsByStatus.inc({
      status: res.statusCode.toString(),
    });
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
app.listen(port, '0.0.0.0', () => {
  console.log(`API server listening on port ${port}`);
});
