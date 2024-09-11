import express from 'express';
import { signUp, signIn, verifyToken, updateUser, signOut, deleteUser, getUserInfo } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/signUp', signUp); // Route to sign up
router.post('/signIn', signIn); // Route to sign in
router.get('/verifyToken', authenticateToken, verifyToken); // Route to verify token
router.patch('/updateUser/:uid', authenticateToken, updateUser); // Route to update user
router.post('/signOut', authenticateToken, signOut); // Route to sign out
router.delete('/deleteUser/:uid', authenticateToken, deleteUser); // Route to delete user
router.get('/userInfo', authenticateToken, getUserInfo); // Route to get user info



export default router;
