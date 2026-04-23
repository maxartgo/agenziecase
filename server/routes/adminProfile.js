import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

// GET /api/admin/profile - Ottieni profilo admin
router.get('/', async (req, res) => {
  try {
    const { userId } = req.user; // userId viene dal middleware di autenticazione

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({
        success: false,
        error: 'Admin non trovato'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Errore get admin profile:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero del profilo'
    });
  }
});

// PUT /api/admin/profile - Aggiorna profilo admin
router.put('/', async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, phone, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({
        success: false,
        error: 'Admin non trovato'
      });
    }

    // Se si sta cambiando email, verifica che non sia già in uso
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email già in uso'
        });
      }
    }

    // Aggiorna i campi permessi
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (email) updates.email = email;

    await user.update(updates);

    res.json({
      success: true,
      message: 'Profilo aggiornato con successo',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Errore update admin profile:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'aggiornamento del profilo'
    });
  }
});

// PUT /api/admin/profile/password - Cambia password admin
router.put('/password', async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password corrente e nuova password sono richieste'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La nuova password deve avere almeno 6 caratteri'
      });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({
        success: false,
        error: 'Admin non trovato'
      });
    }

    // Verifica password corrente
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Password corrente non corretta'
      });
    }

    // Hash della nuova password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password cambiata con successo'
    });
  } catch (error) {
    console.error('Errore change password:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel cambio password'
    });
  }
});

export default router;