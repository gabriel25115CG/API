import client from 'prom-client';
import os from 'os';
import diskusage from 'diskusage';  // Importer le module diskusage

// Créer un compteur pour les requêtes HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Créer un histogramme pour la durée des requêtes HTTP
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 1.5, 5, 10],  // Exemple de buckets pour la durée
});

// Créer une métrique pour l'utilisation du CPU
const cpuUsage = new client.Gauge({
  name: 'cpu_usage_percentage',
  help: 'CPU usage as a percentage',
});

// Créer une métrique pour l'utilisation de la mémoire RAM
const memoryUsage = new client.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
});

// Créer une métrique pour l'utilisation du disque
const diskUsage = new client.Gauge({
  name: 'disk_usage_bytes',
  help: 'Disk usage in bytes',
});

const diskTotal = new client.Gauge({
  name: 'disk_total_bytes',
  help: 'Total disk space in bytes',
});

// Créer des métriques pour les erreurs HTTP (par statut)
const httpRequestsByStatus = new client.Counter({
  name: 'http_requests_by_status',
  help: 'Number of HTTP requests by status code',
  labelNames: ['status'],
});

// Créer une métrique pour la durée moyenne des requêtes
const httpResponseDurationAvg = new client.Gauge({
  name: 'http_response_duration_avg_seconds',
  help: 'Average HTTP response time in seconds',
});

// Fonction pour collecter l'utilisation du CPU
function updateCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  // Calculer l'utilisation globale du CPU
  for (let i = 0; i < cpus.length; i++) {
    const cpu = cpus[i];
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = (1 - idle / total) * 100; // Calcul du pourcentage d'utilisation du CPU

  cpuUsage.set(usage);
}

// Fonction pour collecter l'utilisation de la mémoire
function updateMemoryUsage() {
  const totalMemory = os.totalmem(); // Total de la RAM en bytes
  const freeMemory = os.freemem(); // Mémoire libre en bytes
  const usedMemory = totalMemory - freeMemory;

  memoryUsage.set(usedMemory); // Définir la valeur de la métrique de mémoire utilisée
}

// Fonction pour collecter l'utilisation du disque
function updateDiskUsage() {
  const pathToCheck = '/';  // Définir le chemin du disque à surveiller (par exemple, la racine du système de fichiers)
  diskusage.check(pathToCheck, (err, info) => {
    if (err) {
      console.error('Error fetching disk stats:', err);
      return;
    }
    diskTotal.set(info.total); // Espace total
    diskUsage.set(info.free); // Espace libre
  });
}

// Fonction pour collecter la durée moyenne des requêtes HTTP
let totalRequestTime = 0;
let requestCount = 0;
function updateAvgResponseTime(duration) {
  totalRequestTime += duration;
  requestCount += 1;
  const avgDuration = totalRequestTime / requestCount;
  httpResponseDurationAvg.set(avgDuration);
}

// Mettre à jour les métriques toutes les 10 secondes
setInterval(() => {
  updateCpuUsage();
  updateMemoryUsage();
  updateDiskUsage();
}, 10000);

// Exposer ces métriques
export { 
  httpRequestsTotal, 
  httpRequestDurationSeconds, 
  cpuUsage, 
  memoryUsage, 
  diskUsage, 
  diskTotal, 
  httpRequestsByStatus, 
  httpResponseDurationAvg,
  updateAvgResponseTime 
};
