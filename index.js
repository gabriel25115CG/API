import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import firestoreRoutes from './routes/firestoreRoutes.js'; // Importer les routes Firestore
import { validateEnv } from './utils/validateEnv.js';
import { authenticateToken } from './middleware/authMiddleware.js'; // Importer le middleware d'authentification
import { collectDefaultMetrics, register, Histogram } from 'prom-client'; // Importation de prom-client

// Charger les variables d'environnement
dotenv.config();

// Valider les variables d'environnement
validateEnv();

const app = express();
app.use(express.json());

// Route de base
app.get('/', (req, res) => {
  const name = process.env.NAME || '?';
  res.send(`What are you doing here ${name}!`);
});

// Middleware d'authentification
app.use('/api/auth/updateUser', authenticateToken);

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/firestore', firestoreRoutes);

// Collecte des métriques par défaut (comme le nombre de requêtes HTTP, la mémoire, etc.)
collectDefaultMetrics();

// Créer une métrique personnalisée pour la durée des requêtes HTTP
const httpDurationHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  buckets: [0.1, 0.3, 1.5, 5, 10]  // Durée des requêtes en secondes
});

// Middleware pour mesurer la durée des requêtes HTTP
app.use((req, res, next) => {
  const end = httpDurationHistogram.startTimer(); // Démarrer le chronomètre
  res.on('finish', () => {
    // Enregistrer la durée de la requête quand elle est terminée
    end({ route: req.route?.path, method: req.method });
  });
  next();
});

// Exposer les métriques à Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics()); // Récupérer toutes les métriques exposées par Prometheus
});

const port = parseInt(process.env.PORT, 10) || 3000; // Si la variable d'environnement PORT n'est pas définie, utiliser le port 3000

// Démarrer le serveur
app.listen(port, (err) => {
  if (err) {
    console.error(`Error occurred while trying to listen on port ${port}:`, err);
    process.exit(1); // Arrêter l'application en cas d'erreur
  }
  console.log(`Listening on port ${port}`);
});
