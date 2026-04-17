import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import registerAgentRoute from './auth/register-agent.js';
import resetPasswordRoute from './auth/reset-password.js';

const router = express.Router();

// Routes pubbliche
router.post('/register', register);      // Registrazione Partner
router.post('/login', login);            // Login

// Routes protette (richiedono autenticazione)
router.get('/me', authenticateToken, getCurrentUser);           // Profilo utente
router.put('/me', authenticateToken, updateProfile);            // Aggiorna profilo
router.post('/change-password', authenticateToken, changePassword);  // Cambia password

// Route per registrazione agenti (solo Partner)
router.use('/', registerAgentRoute);     // Registrazione Agente

// Route per reset password
router.use('/', resetPasswordRoute);     // Reset Password

export default router;
