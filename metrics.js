import client from 'prom-client';

// Créer un compteur pour les requêtes HTTP (total de toutes les requêtes, avec méthode, route et statut)
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests made.',
  labelNames: ['method', 'route', 'status'],
});

// Créer un compteur pour les requêtes GET et POST séparées
const httpRequestsMethodCount = new client.Counter({
  name: 'http_requests_method_count',
  help: 'Count of HTTP requests by method (GET/POST)',
  labelNames: ['method'], // Comptabiliser les méthodes GET, POST
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
client.register.registerMetric(httpRequestsMethodCount); // Enregistrer le compteur des méthodes HTTP

// Middleware pour incrémenter les compteurs de requêtes
function countHttpRequests(req, res, next) {
  const method = req.method; // Récupérer la méthode HTTP (GET, POST, etc.)
  const route = req.route?.path || req.url; // Récupérer la route de la requête
  res.on('finish', () => {
    // Incrémenter le compteur des requêtes HTTP total avec méthode, route et statut
    httpRequestsTotal.inc({ method, route, status: res.statusCode });

    // Incrémenter le compteur des requêtes HTTP par méthode (GET/POST)
    httpRequestsMethodCount.inc({ method });
  });
  next();
}

// Middleware pour mesurer la durée des requêtes HTTP
function measureHttpRequestDuration(req, res, next) {
  const end = httpRequestDurationSeconds.startTimer(); // Démarre le chronomètre
  res.on('finish', () => {
    // Enregistrer la durée de la requête une fois terminée
    end({ method: req.method, route: req.route?.path });
  });
  next();
}

// Exporter les middlewares et les métriques pour utilisation dans l'application
export { countHttpRequests, measureHttpRequestDuration, httpRequestsTotal, httpRequestDurationSeconds, httpRequestsMethodCount };
