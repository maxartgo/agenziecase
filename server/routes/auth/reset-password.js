import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../../models/index.js';

const router = express.Router();

/**
 * POST /api/auth/request-password-reset
 * Verifica se l'email esiste e permette il reset della password
 */
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email richiesta'
      });
    }

    // Verifica se l'utente esiste
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Email non trovata nel sistema'
      });
    }

    // Per semplicità, in questo caso permettiamo il reset immediato
    // In produzione, dovresti inviare un'email con un token di reset
    res.json({
      success: true,
      message: 'Email verificata. Puoi procedere con il reset della password.',
      userId: user.id
    });

  } catch (error) {
    console.error('❌ Errore richiesta reset password:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la richiesta di reset password'
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset della password (per agenti che devono impostare la password iniziale)
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validazione
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email e nuova password sono richiesti'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La password deve essere di almeno 6 caratteri'
      });
    }

    // Trova l'utente
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      });
    }

    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Aggiorna la password
    await user.update({ password: hashedPassword });

    console.log('✅ Password resettata per:', email);

    res.json({
      success: true,
      message: 'Password aggiornata con successo. Puoi ora effettuare il login.'
    });

  } catch (error) {
    console.error('❌ Errore reset password:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il reset della password'
    });
  }
});

export default router;
