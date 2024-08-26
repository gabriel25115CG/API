// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Votre API',
      version: '1.0.0',
      description: 'Documentation de l\'API',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
  },
  apis: ['./routes/*.js'], // Indiquez où Swagger doit chercher les définitions de routes
};

const swaggerSpec = swaggerJsdoc(options);

export default function swaggerDocs(app, port) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`La documentation est disponible sur http://localhost:${port}/api-docs`);
}
