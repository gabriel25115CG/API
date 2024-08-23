// authMiddleware.js

import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../controllers/authController.js'; // Assurez-vous que le chemin est correct

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  // Vérifier si le token est dans la blacklist
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  jwt.verify(token, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }

    req.user = user;
    next();
  });
};
