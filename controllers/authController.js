// controllers/authController.js

import admin from '../config/firebaseConfig.js';
import jwt from 'jsonwebtoken';

// Inscription d'un utilisateur
export const signUp = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error('Error creating new user:', error.message);
    res.status(500).json({ error: 'Failed to create user. ' + error.message });
  }
};

// Connexion d'un utilisateur (authentification et génération d'un token)
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authentification via Firebase Client SDK, ici une simplification
    const user = await admin.auth().getUserByEmail(email);

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      privateKey,
      { 
        algorithm: 'RS256',
        expiresIn: '1h',
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error signing in:', error.message);
    res.status(500).json({ error: 'Failed to sign in. ' + error.message });
  }
};

// Vérifier l'authentification d'un token
export const verifyToken = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ error: 'Token manquant' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.status(200).json({ uid: decodedToken.uid });
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.status(401).json({ error: 'Token invalide' });
  }
};
