// server/routes/auth.example.js
// ESEMPIO: Come applicare la validazione alle routes esistenti

import express from 'express'
import { validate } from '../middleware/validate.js'
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validations/auth.validation.js'

const router = express.Router()

/**
 * POST /api/auth/register
 * Registrazione nuovo utente con validazione
 */
router.post(
  '/register',
  validate(registerSchema), // ✅ Validazione automatica
  async (req, res) => {
    try {
      // I dati sono già validati e sanitizzati
      const { name, email, password, phone, role } = req.body

      // Logica di registrazione...
      // - Verifica se email esiste già
      // - Hash password
      // - Crea utente
      // - Invia email di conferma

      res.status(201).json({
        message: 'Utente registrato con successo',
        user: { id, name, email, role }
      })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({
        error: 'Errore durante la registrazione'
      })
    }
  }
)

/**
 * POST /api/auth/login
 * Login con validazione
 */
router.post(
  '/login',
  validate(loginSchema), // ✅ Validazione automatica
  async (req, res) => {
    try {
      const { email, password } = req.body

      // Logica di login...
      // - Cerca utente per email
      // - Verifica password
      // - Genera JWT token

      res.json({
        message: 'Login successful',
        token,
        user
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(401).json({
        error: 'Credenziali non valide'
      })
    }
  }
)

/**
 * POST /api/auth/change-password
 * Cambio password con validazione
 */
router.post(
  '/change-password',
  authenticate, // Middleware autenticazione
  validate(changePasswordSchema), // ✅ Validazione automatica
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body
      const userId = req.user.id

      // Logica cambio password...
      // - Verifica password attuale
      // - Aggiorna con nuova password
      // - Invalida vecchi token

      res.json({
        message: 'Password aggiornata con successo'
      })
    } catch (error) {
      console.error('Change password error:', error)
      res.status(400).json({
        error: 'Impossibile aggiornare la password'
      })
    }
  }
)

/**
 * POST /api/auth/forgot-password
 * Password dimenticata con validazione
 */
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema), // ✅ Validazione automatica
  async (req, res) => {
    try {
      const { email } = req.body

      // Logica password dimenticata...
      // - Genera token reset
      // - Invia email con link

      res.json({
        message: 'Email di reset inviata'
      })
    } catch (error) {
      console.error('Forgot password error:', error)
      res.status(500).json({
        error: 'Errore durante l\'invio dell\'email'
      })
    }
  }
)

/**
 * POST /api/auth/reset-password
 * Reset password con validazione
 */
router.post(
  '/reset-password',
  validate(resetPasswordSchema), // ✅ Validazione automatica
  async (req, res) => {
    try {
      const { token, newPassword } = req.body

      // Logica reset password...
      // - Verifica token
      // - Aggiorna password
      // - Invalida token

      res.json({
        message: 'Password resettata con successo'
      })
    } catch (error) {
      console.error('Reset password error:', error)
      res.status(400).json({
        error: 'Token non valido o scaduto'
      })
    }
  }
)

export default router
