// prometheus.js

import client from 'prom-client';
import express from 'express';

// Créer une instance d'Express pour exposer les métriques
const app = express();

// Créer une métrique Histogram pour suivre les durées des requêtes HTTP
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'], // Méthode, route et code de statut
  buckets: [0.1, 0.3, 1.5, 5, 10],  // Durée des requêtes en secondes
});

// Middleware pour mesurer la durée des requêtes
export function initPrometheus(app) {
  // Enregistrer la métrique quand chaque requête est effectuée
  app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer(); // Démarrer le chronomètre
    res.on('finish', () => {
      // Enregistrer la durée de la requête une fois qu'elle est terminée
      end({ route: req.route?.path, method: req.method, status_code: res.statusCode });
    });
    next();
  });

  // Exposer les métriques à Prometheus via l'endpoint /metrics
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics()); // Récupérer toutes les métriques exposées
  });
}
