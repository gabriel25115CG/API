import express from 'express';
import admin from '../config/firebaseConfig.js'; 

const router = express.Router();
const db = admin.firestore();


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
