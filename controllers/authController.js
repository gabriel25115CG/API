import admin from '../config/firebaseConfig.js';
import jwt from 'jsonwebtoken';

// Inscription d'un utilisateur
export const signUp = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Création de l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    // Retourne les informations de l'utilisateur créé
    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error('Error creating new user:', error.message);
    res.status(500).json({ error: 'Failed to create user. ' + error.message });
  }
};

// Connexion d'un utilisateur (authentification et génération d'un token)
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Note: Firebase Admin SDK ne permet pas de vérifier les mots de passe directement.
    // Vous devez vérifier le mot de passe via Firebase Client SDK ou autre méthode.

    // Ici, on suppose que l'utilisateur existe (cela ne vérifie pas le mot de passe)
    const user = await admin.auth().getUserByEmail(email);

    // Clé privée pour signer le token
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // Assurez-vous que la clé privée est correctement formatée
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Génération du JWT
    const token = jwt.sign(
      { uid: user.uid, email: user.email },  // Payload du token
      privateKey,  // Clé privée RSA
      { 
        algorithm: 'RS256',
        expiresIn: '1h',
        audience: 'your-audience',  // Ajustez l'audience si nécessaire
        issuer: 'your-issuer',      // Ajustez l'émetteur si nécessaire
      }
    );

    res.status(200).json({ token });  // Retourne le token généré
  } catch (error) {
    console.error('Error signing in:', error.message);
    res.status(500).json({ error: 'Failed to sign in. ' + error.message });
  }
};

// Vérifier l'authentification d'un token
export const verifyToken = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Attendez-vous à un format `Bearer <token>`

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
