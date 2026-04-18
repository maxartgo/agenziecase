const express = require('express');
const router = express.Router();
const { sendEmail, emailTemplates } = require('../config/email');

// Test email semplice
router.post('/test-simple', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const result = await sendEmail({
      to: email,
      subject: '✅ Test Email OVH - AgenzieCase',
      html: emailTemplates.welcome('Utente Test'),
      text: 'Test email from AgenzieCase - OVH SMTP configuration successful!'
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Email inviata con successo!',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test email template benvenuto
router.post('/test-welcome', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email e nome richiesti' });
  }

  try {
    const result = await sendEmail({
      to: email,
      subject: '🏠 Benvenuto su AgenzieCase!',
      html: emailTemplates.welcome(name),
      text: `Benvenuto su AgenzieCase, ${name}!`
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Email di benvenuto inviata!',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
