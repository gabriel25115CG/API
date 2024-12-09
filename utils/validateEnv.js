// utils/validateEnv.js

export const validateEnv = () => {
    const requiredEnvVars = [
      'GOOGLE_SERVICE_ACCOUNT_TYPE',
      'GOOGLE_PROJECT_ID',
      'GOOGLE_PRIVATE_KEY_ID',
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_AUTH_URI',
      'GOOGLE_TOKEN_URI',
      'GOOGLE_AUTH_PROVIDER_CERT_URL',
      'GOOGLE_CLIENT_CERT_URL',
      'PORT' 
    ];
  
    requiredEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1); // Arrête l'application si une variable est manquante
      }
    });
  
    // Optionnel: Vérifiez les formats spécifiques si nécessaire (par exemple, PORT devrait être un nombre)
    const port = parseInt(process.env.PORT, 10);
    if (isNaN(port)) {
      console.error('Invalid PORT value, it should be a number.');
      process.exit(1);
    }
  };
  