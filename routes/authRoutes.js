// routes/authRoutes.js

import express from 'express';
import { signUp, signIn, verifyToken, updateUser, signOut, deleteUser, getUserInfo } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.get('/verifyToken', authenticateToken, verifyToken);
router.patch('/updateUser/:uid', authenticateToken, updateUser);
router.post('/signOut', authenticateToken, signOut);
router.delete('/deleteUser/:uid', authenticateToken, deleteUser); 
router.get('/userInfo', authenticateToken, getUserInfo);


export default router;
