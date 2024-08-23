// routes/authRoutes.js

import express from 'express';
import { signUp, signIn, verifyToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { updateUser } from '../controllers/authController.js';
import { signOut } from '../controllers/authController.js';

const router = express.Router();

// Route pour l'inscription
router.post('/signUp', signUp);

// Route pour la connexion
router.post('/signIn', signIn);

// Route pour vérifier le token
router.get('/verifyToken', authenticateToken, verifyToken);

// Route pour modifier les infos 
router.patch('/updateUser/:uid', authenticateToken, updateUser);

// Route pour la deconnexion 
router.post('/signOut', authenticateToken, signOut); 


export default router;
