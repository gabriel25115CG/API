import admin from './config/firebaseConfig.js';
const db = admin.firestore();

async function addTestDocument() {
  try {
    const docRef = db.collection('testCollection').doc('testDoc');
    await docRef.set({
      field1: 'value1',
      field2: 'value2'
    });
    console.log('Document ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document:', error);
  }
}

addTestDocument();
