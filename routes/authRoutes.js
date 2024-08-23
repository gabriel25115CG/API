// routes/authRoutes.js

import express from 'express';
import { signUp, signIn, verifyToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour l'inscription
router.post('/signUp', signUp);

// Route pour la connexion
router.post('/signIn', signIn);

// Route pour vérifier le token
router.get('/verifyToken', authenticateToken, verifyToken);

export default router;
