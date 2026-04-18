#!/bin/bash
# 📧 CONFIGURAZIONE EMAIL OVH - AGENZIECASE

echo "📧 CONFIGURAZIONE EMAIL OVH"
echo "=========================="
echo ""

# Configurazione SMTP OVH
SMTP_HOST="ssl0.ovh.net"
SMTP_PORT="465"
SMTP_SECURE="true"
EMAIL_FROM="info@agenziecase.com"
EMAIL_FROM_NAME="AgenzieCase"
EMAIL_REPLY_TO="info@agenziecase.com"

echo "🔑 CONFIGURAZIONE SMTP OVH:"
echo "   Host: $SMTP_HOST"
echo "   Porta: $SMTP_PORT"
echo "   Email: $EMAIL_FROM"
echo ""

echo "📝 Creo configurazione email..."

# Crea directory config se non esiste
mkdir -p server/config

# Crea file configurazione email
cat > server/config/email.js << 'EOF'
// Email configuration with OVH SMTP
const nodemailer = require('nodemailer');

const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'ssl0.ovh.net',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
};

const sendEmail = async (options) => {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'AgenzieCase'} <${process.env.EMAIL_FROM || 'info@agenziecase.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  welcome: (userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50;">🏠 Benvenuto su AgenzieCase!</h1>
      <p>Ciao <strong>${userName}</strong>,</p>
      <p>Grazie per esserti registrato su <strong>AgenzieCase</strong>!</p>
      <p>Il tuo account è stato creato con successo e sei pronto per iniziare.</p>
      <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p>✅ Account verificato</p>
        <p>✅ Profilo completato</p>
        <p>✅ Pronto a cercare immobili</p>
      </div>
      <p>Puoi accedere subito:</p>
      <p><a href="${process.env.FRONTEND_URL || 'https://agenziecase.com'}/login" style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accedi al tuo account</a></p>
      <br>
      <p>Se hai domande, contattaci:</p>
      <p>📧 Email: info@agenziecase.com</p>
      <br>
      <p>Cordiali saluti,<br><strong>Il team di AgenzieCase</strong></p>
    </div>
  `,

  passwordReset: (resetToken) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #e74c3c;">🔑 Reset Password</h1>
      <p>Hai richiesto di resettare la tua password.</p>
      <p>Clicca sul link sottostante per procedere:</p>
      <p><a href="${process.env.FRONTEND_URL || 'https://agenziecase.com'}/reset-password?token=${resetToken}" style="background: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Resetta Password</a></p>
      <p>Oppure copia questo link nel browser:</p>
      <p style="background: #ecf0f1; padding: 10px; border-radius: 5px; word-break: break-all;">${process.env.FRONTEND_URL || 'https://agenziecase.com'}/reset-password?token=${resetToken}</p>
      <br>
      <p>⚠️ <strong>Questo link scade tra 1 ora.</strong></p>
      <p>Se non hai richiesto il reset, ignora questa email.</p>
      <br>
      <p>Cordiali saluti,<br><strong>Il team di AgenzieCase</strong></p>
    </div>
  `,

  contactNotification: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #3498db;">📬 Nuovo Contatto dal Sito</h1>
      <p>Hai ricevuto un nuovo messaggio dal form di contatto:</p>
      <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Telefono:</strong> ${data.phone || 'Non fornito'}</p>
        <p><strong>Messaggio:</strong></p>
        <p style="font-style: italic;">${data.message}</p>
      </div>
      <p>Rispondi il prima possibile!</p>
      <br>
      <p>Data: ${new Date().toLocaleString('it-IT')}</p>
    </div>
  `,

  propertyInquiry: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #27ae60;">🏠 Richiesta Informazioni Immobile</h1>
      <p>Un utente è interessato a un immobile:</p>
      <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Immobile:</strong> ${data.propertyTitle || 'N/D'}</p>
        <p><strong>Riferimento:</strong> ${data.propertyId || 'N/D'}</p>
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Telefono:</strong> ${data.phone || 'Non fornito'}</p>
        <p><strong>Messaggio:</strong></p>
        <p style="font-style: italic;">${data.message}</p>
      </div>
      <p>Contatta l'interessato al più presto!</p>
      <br>
      <p>Data: ${new Date().toLocaleString('it-IT')}</p>
    </div>
  `
};

module.exports = {
  sendEmail,
  createEmailTransporter,
  emailTemplates
};
EOF

echo "✅ File configurazione email creato!"
echo ""

# Aggiorna .env.production
echo "📝 Aggiorno file environment..."
cat >> .env.production << EOF

# Email Configuration (OVH SMTP)
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@agenziecase.com
SMTP_PASSWORD=LA_TUA_PASSWORD_OVH
EMAIL_FROM=info@agenziecase.com
EMAIL_FROM_NAME=AgenzieCase
EMAIL_REPLY_TO=info@agenziecase.com
EOF

echo "✅ Environment aggiornato!"
echo ""

# Crea endpoint test email
cat > server/routes/testEmail.js << 'EOF'
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

module.exports = router;
EOF

echo "✅ Endpoint test email creati!"
echo ""

# Installa nodemailer se non presente
echo "📦 Installo dipendenze email..."
cd server
if ! grep -q "nodemailer" package.json; then
  npm install nodemailer
  echo "✅ Nodemailer installato!"
else
  echo "✅ Nodemailer già presente"
fi
cd ..

echo ""
echo "🎉 CONFIGURAZIONE EMAIL COMPLETATA!"
echo ""
echo "📋 PROSSIMI PASSI:"
echo ""
echo "1. ⚠️ IMPORTANTE - Inserisci la password email OVH:"
echo "   Apri .env.production e sostituisci 'LA_TUA_PASSWORD_OVH' con la tua password"
echo ""
echo "2. 🚀 Deploy sul server:"
echo "   git add ."
echo "   git commit -m 'feat: add OVH email configuration'"
echo "   git push origin main"
echo ""
echo "3. 📧 Test email:"
echo "   curl -X POST https://agenziecase.com/api/test/test-welcome \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"tua-email@test.com\",\"name\":\"Mario\"}'"
echo ""
echo "✅ CONFIGURAZIONE COMPLETA!"
echo "📧 Sistema email pronto con OVH SMTP!"
echo ""