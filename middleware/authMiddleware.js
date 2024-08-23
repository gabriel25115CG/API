// middleware/authMiddleware.js

import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }

    req.user = user;
    next();
  });
};
