import express from 'express';
import client from 'prom-client';

const app = express();

// Créer une instance de compteur pour suivre les requêtes HTTP
const httpRequestDurationMicroseconds = new client.Counter({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'], // Ajoute 'route' ici
});

// Middleware pour capturer les métriques HTTP
app.use((req, res, next) => {
  const end = res.end;
  res.end = (...args) => {
    const duration = Date.now() - req.start;
    // Assurez-vous que 'route' est capturé correctement, par exemple en utilisant req.originalUrl
    httpRequestDurationMicroseconds.labels(req.method, req.originalUrl, res.statusCode).inc(duration);
    end.apply(res, args);
  };
  next();
});

// Route pour exposer les métriques
app.get('/metrics', (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(client.register.metrics());
});

// Lancer un serveur pour Prometheus
app.listen(9090, () => {
  console.log('Prometheus metrics exposed at http://localhost:9090/metrics');
});
