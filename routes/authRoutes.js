import express from 'express';
import { signUp, signIn, verifyToken, updateUser, signOut, deleteUser, getUserInfo } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Routes for user authentication
 */

/**
 * @swagger
 * /auth/signUp:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Bad request
 */
router.post('/signUp', signUp);

/**
 * @swagger
 * /auth/signIn:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       401:
 *         description: Unauthorized
 */
router.post('/signIn', signIn);

/**
 * @swagger
 * /auth/verifyToken:
 *   get:
 *     summary: Verify the user's token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Unauthorized
 */
router.get('/verifyToken', authenticateToken, verifyToken);

/**
 * @swagger
 * /auth/updateUser/{uid}:
 *   patch:
 *     summary: Update a user's information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.patch('/updateUser/:uid', authenticateToken, updateUser);

/**
 * @swagger
 * /auth/signOut:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/signOut', authenticateToken, signOut);

/**
 * @swagger
 * /auth/deleteUser/{uid}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.delete('/deleteUser/:uid', authenticateToken, deleteUser); 

/**
 * @swagger
 * /auth/userInfo:
 *   get:
 *     summary: Get user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/userInfo', authenticateToken, getUserInfo);

export default router;
