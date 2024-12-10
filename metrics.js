import client from 'prom-client';

// Créer un compteur pour les requêtes HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests made.',
  labelNames: ['method', 'route', 'status'],
});

// Créer un histogramme pour les temps de réponse
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Histogram of HTTP request duration in seconds.',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 1.5, 5, 10], // Durée en secondes
});

// Enregistrer les métriques
client.register.registerMetric(httpRequestsTotal);
client.register.registerMetric(httpRequestDurationSeconds);

export { httpRequestsTotal, httpRequestDurationSeconds };
