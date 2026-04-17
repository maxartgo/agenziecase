import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Middleware per verificare il token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    // Estrai il token dall'header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token di autenticazione mancante'
      });
    }

    // Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Trova l'utente nel database
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    // Aggiungi l'utente alla richiesta
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Token non valido'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Token scaduto'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Errore durante la verifica del token'
    });
  }
};

// Middleware per verificare i ruoli
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Utente non autenticato'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Non hai i permessi per questa operazione'
      });
    }

    next();
  };
};

// Middleware opzionale (non blocca se non c'è token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Se c'è un errore, continua senza utente
    next();
  }
};
