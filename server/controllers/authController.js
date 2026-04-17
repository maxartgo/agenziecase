import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Funzione per generare JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register - Registrazione nuovo utente
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validazione campi obbligatori
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, nome e cognome sono obbligatori'
      });
    }

    // Verifica se l'email è già registrata
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email già registrata'
      });
    }

    // Hash della password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crea il nuovo utente
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role: 'user', // Di default tutti sono 'user'
      isVerified: false
    });

    // Genera token JWT
    const token = generateToken(newUser.id);

    // Risposta (non inviare la password!)
    res.status(201).json({
      success: true,
      message: 'Registrazione completata con successo',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la registrazione'
    });
  }
};

// POST /api/auth/login - Login utente
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validazione
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e password sono obbligatorie'
      });
    }

    // Trova l'utente
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenziali non valide'
      });
    }

    // Verifica la password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenziali non valide'
      });
    }

    // Aggiorna last login
    user.lastLogin = new Date();
    await user.save();

    // Genera token JWT
    const token = generateToken(user.id);

    // Risposta
    res.json({
      success: true,
      message: 'Login effettuato con successo',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il login'
    });
  }
};

// GET /api/auth/me - Ottieni dati utente corrente
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] } // Non inviare la password
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Errore getCurrentUser:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il recupero dei dati utente'
    });
  }
};

// PUT /api/auth/me - Aggiorna profilo utente
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    // Aggiorna solo i campi forniti
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profilo aggiornato con successo',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Errore updateProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'aggiornamento del profilo'
    });
  }
};

// POST /api/auth/change-password - Cambia password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password attuale e nuova password sono obbligatorie'
      });
    }

    const user = await User.findByPk(req.user.id);

    // Verifica password attuale
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Password attuale non corretta'
      });
    }

    // Hash nuova password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password cambiata con successo'
    });

  } catch (error) {
    console.error('Errore changePassword:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il cambio password'
    });
  }
};
