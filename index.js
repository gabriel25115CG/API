import express from 'express';
import dotenv from 'dotenv';
import { validateEnv } from './utils/validateEnv.js'; 
import { authenticateToken } from './middleware/authMiddleware.js'; 
import authRoutes from './routes/authRoutes.js';
import firestoreRoutes from './routes/firestoreRoutes.js';
import { 
  httpRequestsTotal, 
  httpRequestDurationSeconds, 
  httpRequestsByStatus, 
  updateAvgResponseTime 
} from './metrics.js'; 
import client from 'prom-client'; 

dotenv.config();

validateEnv();


// Créer l'application Express
const app = express();
app.use(express.json());


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
