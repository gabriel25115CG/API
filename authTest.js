// authTest.js
import admin from './config/firebaseConfig.js';
// Fonction pour tester la création d'un utilisateur
const createUser = async () => {
  console.log('Début du test de création d’utilisateur...');
  
  try {
    const userRecord = await admin.auth().createUser({
      email: 'user@example.com',
      emailVerified: false,
      password: 'password',
      displayName: 'John Doe',
      disabled: false,
    });
    console.log('Utilisateur créé avec succès :', userRecord.uid);
  } catch (error) {
    console.error('Erreur lors de la création de l’utilisateur :', error);
    console.error('Détails de l’erreur :', error.details || 'Aucun détail disponible');
    console.error('Code de l’erreur :', error.code || 'Aucun code d’erreur disponible');
  }
};

createUser();