// middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import admin from '../config/firebaseConfig.js';

const db = admin.firestore();

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }

    try {
      // Vérifier que l'utilisateur existe encore dans Firestore
      const userRef = db.collection('users').doc(decoded.uid);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      req.user = decoded; // Ajouter les informations de l'utilisateur dans la requête
      next();
    } catch (error) {
      console.error('Error verifying token:', error.message);
      res.status(500).json({ error: 'Erreur de vérification du token' });
    }
  });
};
