import admin from '../config/firebaseConfig.js'; // Assurez-vous que le chemin est correct
import jwt from 'jsonwebtoken';

const db = admin.firestore();

// Inscription d'un utilisateur
export const signUp = async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, address } = req.body;

  console.log('Received request body:', req.body);

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Créer l'utilisateur avec Firebase Authentication
    const userRecord = await admin.auth().createUser({ email, password });
    console.log('User created successfully:', userRecord.uid);

    // Ajouter les informations supplémentaires dans Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      firstName,
      lastName,
      phoneNumber,
      address,
      createdAt: new Date(),
    });
    console.log('User data added to Firestore:', { uid: userRecord.uid, firstName, lastName, phoneNumber, address });

    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error('Error creating new user:', error.message);
    res.status(500).json({ error: 'Failed to create user. ' + error.message });
  }
};

// Connexion d'un utilisateur (authentification et génération d'un token)
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  console.log('Sign in request received:', { email });

  try {
    // Authentifier l'utilisateur et récupérer ses informations
    const user = await admin.auth().getUserByEmail(email);

    // Générer un token JWT
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      privateKey,
      { 
        algorithm: 'RS256',
        expiresIn: '5h',
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error signing in:', error.message);
    res.status(500).json({ error: 'Failed to sign in. ' + error.message });
  }
};

// Vérifier l'authentification d'un token
export const verifyToken = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ error: 'Token manquant' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.status(200).json({ uid: decodedToken.uid });
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.status(401).json({ error: 'Token invalide' });
  }
};

// Mettre à jour les informations d'un utilisateur
export const updateUser = async (req, res) => {
  const { uid } = req.params;
  const { firstName, lastName, phoneNumber, address } = req.body;

  // Assurez-vous que l'utilisateur est authentifié et que l'UID correspond
  if (!req.user || req.user.uid !== uid) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Référence au document de l'utilisateur dans Firestore
    const userRef = db.collection('users').doc(uid);

    // Mettre à jour les informations de l'utilisateur
    await userRef.update({
      firstName,
      lastName,
      phoneNumber,
      address
    });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Failed to update user. ' + error.message });
  }
};

// Déconnexion d'un utilisateur (invalidant le token côté serveur)
let tokenBlacklist = [];

export const signOut = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ error: 'Token manquant' });
  }

  try {
    // Ajouter le token à la blacklist
    tokenBlacklist.push(token);

    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Error during sign out:', error.message);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
};

// Vérifier si le token est dans la blacklist
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.includes(token);
};

// Supprimer le compte d'un utilisateur
export const deleteUser = async (req, res) => {
  const { uid } = req.params;

  // Assurez-vous que l'utilisateur est authentifié et que l'UID correspond
  if (!req.user || req.user.uid !== uid) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Supprimer l'utilisateur de Firebase Authentication
    await admin.auth().deleteUser(uid);
    console.log('User deleted from Firebase Authentication:', uid);

    // Supprimer les informations de l'utilisateur de Firestore
    await db.collection('users').doc(uid).delete();
    console.log('User data deleted from Firestore:', uid);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Failed to delete user. ' + error.message });
  }
};

export const getUserInfo = async (req, res) => {
  const uid = req.user.uid; // UID de l'utilisateur authentifié

  try {
    // Référence au document de l'utilisateur dans Firestore
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error getting user info:', error.message);
    res.status(500).json({ error: 'Failed to get user info. ' + error.message });
  }
};