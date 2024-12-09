
import admin from '../config/firebaseConfig.js'; 

const db = admin.firestore();

// Ajouter un document dans Firestore
export const addDocument = async (req, res) => {
  const { collection, docId, data } = req.body;

  try {
    const docRef = db.collection(collection).doc(docId);
    await docRef.set(data);
    res.status(200).json({ message: 'Document ajouté avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document:', error.message);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du document. ' + error.message });
  }
};

// Lire un document depuis Firestore
export const getDocument = async (req, res) => {
  const { collection, docId } = req.params;

  try {
    const docRef = db.collection(collection).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Erreur lors de la lecture du document:', error.message);
    res.status(500).json({ error: 'Erreur lors de la lecture du document. ' + error.message });
  }
};
