// controllers/authController.js

import admin from '../config/firebaseConfig.js';

// Inscription d'un utilisateur
export const signUp = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Connexion d'un utilisateur (authentification et génération d'un token)
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier les informations d'identification
    const user = await admin.auth().getUserByEmail(email);
    
    // (Note: Firebase Auth ne supporte pas directement la connexion avec mot de passe via Admin SDK)
    // Vous devriez utiliser Firebase Client SDK pour la connexion avec mot de passe
    res.status(400).json({ error: 'Connexion avec mot de passe n\'est pas supportée via Admin SDK' });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ error: error.message });
  }
};

// Vérifier l'authentification d'un token
export const verifyToken = async (req, res) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(400).json({ error: 'Token manquant' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.status(200).json({ uid: decodedToken.uid });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
};
