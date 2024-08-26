import express from 'express';
import admin from '../config/firebaseConfig.js'; 

const router = express.Router();
const db = admin.firestore();

/**
 * @swagger
 * tags:
 *   name: Firestore
 *   description: API for interacting with Firestore
 */

/**
 * @swagger
 * /firestore/addDocument:
 *   post:
 *     summary: Add a document with an automatically generated ID
 *     tags: [Firestore]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collection:
 *                 type: string
 *                 description: The name of the Firestore collection
 *                 example: users
 *               data:
 *                 type: object
 *                 description: The data to store in the document
 *                 example: { "name": "John Doe", "email": "johndoe@example.com" }
 *     responses:
 *       200:
 *         description: Document added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 docId:
 *                   type: string
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Server error
 */
router.post('/addDocument', async (req, res) => {
  const { collection, data } = req.body;

  try {
    if (!collection || !data) {
      return res.status(400).json({ error: 'Collection and data are required.' });
    }

    const docRef = await db.collection(collection).add(data);
    res.status(200).json({ message: 'Document ajouté avec succès', docId: docRef.id });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document:', error.message);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du document. ' + error.message });
  }
});

/**
 * @swagger
 * /firestore/getDocument:
 *   get:
 *     summary: Retrieve a document by its ID
 *     tags: [Firestore]
 *     parameters:
 *       - in: query
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the Firestore collection
 *         example: users
 *       - in: query
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the document to retrieve
 *         example: abc123
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request, missing required parameters
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.get('/getDocument', async (req, res) => {
  const { collection, docId } = req.query;

  try {
    if (!collection || !docId) {
      return res.status(400).json({ error: 'Collection and docId are required.' });
    }

    const docRef = db.collection(collection).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du document. ' + error.message });
  }
});

export default router;
