import admin from '../config/firebaseConfig.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const db = admin.firestore();

// Inscription d'un utilisateur
export const signUp = async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, address } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Créer l'utilisateur avec Firebase Authentication
    const userRecord = await admin.auth().createUser({ email, password });

    // Ajouter les informations supplémentaires dans Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      email,
      firstName,
      lastName,
      phoneNumber,
      address,
      createdAt: new Date(),
    });

    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error('Error creating new user:', error.message);
    res.status(500).json({ error: 'Failed to create user. ' + error.message });
  }
};

// Connexion d'un utilisateur (authentification et génération d'un token)
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Vérifier les identifiants via l'API REST de Firebase
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken, localId } = response.data;

    // Générer un token JWT personnalisé (optionnel)
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const token = jwt.sign(
      { uid: localId, email },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '5h',
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error signing in:', error.response?.data?.error?.message || error.message);
    res.status(401).json({ error: 'Invalid email or password' });
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

  if (!req.user || req.user.uid !== uid) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      firstName,
      lastName,
      phoneNumber,
      address,
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

  if (!req.user || req.user.uid !== uid) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    await admin.auth().deleteUser(uid);
    await db.collection('users').doc(uid).delete();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Failed to delete user. ' + error.message });
  }
};

// Récupérer les informations de l'utilisateur connecté
export const getUserInfo = async (req, res) => {
  const uid = req.user.uid;

  try {
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
