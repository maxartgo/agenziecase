# 📧 CONFIGURAZIONE EMAIL - AGENZIECASE

## 🎯 TIPOLOGIA EMAIL DA CONFIGURARE:
- ✅ **Email transazionali**: Registrazione, password reset, notifiche
- ✅ **Newsletter e marketing**: Comunicazioni ai clienti

## 🚀 SOLUZIONE CONSIGLIATA: BREVO (Ex Sendinblue)

### Perché Brevo?
- ✅ **Piano gratuito**: 300 email/giorno
- ✅ **SMTP affidabile**: Delivery rate elevato
- ✅ **API completa**: Per integrazioni avanzate
- ✅ **Newsletter editor**: Drag & drop
- ✅ **Analytics**: Tracking email aperture e click
- ✅ **Conforme GDPR**: Per il mercato europeo

---

## 📋 PASSO 1: CREA ACCOUNT BREVO

### 1.1 Registrazione
1. Vai su **https://www.brevo.com/**
2. Clicca **"Sign Up Free"** o **"Inizia Gratis"**
3. Compila il modulo:
   - **Email**: La tua email professionale
   - **Password**: Sicura
   - **Azienda**: AgenzieCase
4. Verifica l'email

### 1.2 Configurazione Iniziale
1. **Conferma** il tuo indirizzo email
2. **Compila** il profilo aziendale
3. **Verifica** il dominio (vedi passo 2)

---

## 📋 PASSO 2: VERIFICA DOMINIO

### 2.1 Aggiungi Dominio su Brevo
1. Accedi a **https://app.brevo.com/**
2. Vai su **Senders** → **Domains** → **Add a new domain**
3. Inserisci: **agenziecase.com**
4. Clicca **"Verify this domain"**

### 2.2 Configura Record DNS su OVH/Cloudflare

#### **Record SPF** (Importante per la consegna email):
```
TYPE: TXT
NAME: @
VALUE: v=spf1 include:spf.brevo.com -all
TTL: 3600
```

#### **Record DKIM** (Già presente se usi OVH):
Se hai i record `ovhmo-selector-*` mantenili!

Se non ci sono, Brevo ti fornirà record DKIM specifici.

### 2.3 Verifica su Brevo
1. Attendi **15-30 minuti** per la propagazione DNS
2. Clicca **"Verify"** su Brevo
3. Dovrebbe diventare **"Verified"**

---

## 📋 PASSO 3: OTTIENI CREDENZIALI SMTP

### 3.1 Crea Chiave SMTP
1. Su Brevo vai su **SMTP & API** → **SMTP** → **New SMTP Key**
2. Inserisci una **descrizione**: "AgenzieCase Server"
3. Seleziona **"Hard bounce"** e **"Spam"** (raccomandato)
4. Clicca **"Generate"**

### 3.2 Salva le Credenziali
Brevo ti mostrerà le credenziali **SALVALE SUBITO!**:

```
SMTP Server: smtp-relay.brevo.com
Port: 587 (oppure 2525)
Login: [your-login@smpt.brevo.com]
Password: [tua-password-SMTP]
```

⚠️ **IMPORTANTE**: Copia queste credenziali subito!

---

## 📋 PASSO 4: CONFIGURA BACKEND

### 4.1 Aggiungi Variabili Environment

Crea o aggiorna il file `.env` sul server:

```bash
# Email Configuration (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-login@smtp.brevo.com
SMTP_PASSWORD=tua-password-smtp
EMAIL_FROM=noreply@agenziecase.com
EMAIL_FROM_NAME=AgenzieCase
EMAIL_REPLY_TO=info@agenziecase.com

# Frontend URL
FRONTEND_URL=https://agenziecase.com
```

### 4.2 Aggiorna Codice Backend

Nel file `server/index.js` o crea un nuovo file `server/config/email.js`:

```javascript
// server/config/email.js
const nodemailer = require('nodemailer');

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: process.env.EMAIL_REPLY_TO
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, createEmailTransporter };
```

### 4.3 Integra Email nel Backend

Aggiorna i file che inviano email (es: registrazione, password reset):

```javascript
// Esempio: server/routes/authRoutes.js
const { sendEmail } = require('../config/email');

// Email di benvenuto
const sendWelcomeEmail = async (userEmail, userName) => {
  const emailHTML = `
    <h2>Benvenuto su AgenzieCase! 🏠</h2>
    <p>Ciao ${userName},</p>
    <p>Grazie per esserti registrato su AgenzieCase!</p>
    <p>Il tuo account è stato creato con successo.</p>
    <p>Puoi accedere qui: <a href="${process.env.FRONTEND_URL}/login">Login</a></p>
    <br>
    <p>Se hai domande, contattaci:</p>
    <p>Email: info@agenziecase.com</p>
    <br>
    <p>Cordiali saluti,<br>Il team di AgenzieCase</p>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Benvenuto su AgenzieCase!',
    html: emailHTML,
    text: `Benvenuto su AgenzieCase! Grazie per la tua registrazione.`
  });
};

// Email di reset password
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const emailHTML = `
    <h2>Reset Password - AgenzieCase</h2>
    <p>Hai richiesto di resettare la tua password.</p>
    <p>Clicca sul link sottostante per procedere:</p>
    <p><a href="${resetURL}">Resetta Password</a></p>
    <p>Oppure copia questo link nel browser:</p>
    <p>${resetURL}</p>
    <br>
    <p>Questo link scade tra 1 ora.</p>
    <p>Se non hai richiesto il reset, ignora questa email.</p>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Reset Password - AgenzieCase',
    html: emailHTML,
    text: `Resetta la tua password qui: ${resetURL}`
  });
};
```

---

## 📋 PASSO 5: INSTALLA DEPENDENZE

### 5.1 Installa Nodemailer
```bash
cd server
npm install nodemailer
```

### 5.2 Aggiorna package.json
Assicurati che `nodemailer` sia nelle dipendenze.

---

## 📋 PASSO 6: DEPLOY E TEST

### 6.1 Deploy con Nuove Configurazioni
```bash
# Sul tuo PC locale
cd C:\Users\uffic\Desktop\agenziecase
git add .
git commit -m "feat: add email configuration with Brevo SMTP"
git push origin main

# Sul server
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66
cd /var/www/agenziecase
git pull
docker build -f Dockerfile.backend -t agenziecase-backend .
docker stop agenziecase-backend
docker rm agenziecase-backend
docker run -d --name agenziecase-backend \
  --network agenziecase_agenziecase-network \
  -p 3001:3001 \
  --env-file .env \
  --restart unless-stopped \
  agenziecase-backend
```

### 6.2 Test Email
Crea un endpoint di test nel backend:

```javascript
// server/routes/testEmail.js
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../config/email');

router.post('/test-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const result = await sendEmail({
      to: email,
      subject: 'Test Email - AgenzieCase',
      html: '<h1>Test Email!</h1><p>Se ricevi questa email, la configurazione SMTP funziona! 🎉</p>',
      text: 'Test email from AgenzieCase'
    });

    if (result.success) {
      res.json({ success: true, message: 'Email sent successfully!' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 📋 PASSO 7: CONFIGURA NEWSLETTER

### 7.1 Crea Template Newsletter su Brevo
1. Vai su **Campaigns** → **Email** → **Create Template**
2. Usa l'editor drag & drop
3. Crea un template "AgenzieCase Newsletter"

### 7.2 Importa Contatti
1. Vai su **Contacts** → **Lists**
2. Crea una lista "Clienti AgenzieCase"
3. Importa contatti da CSV o aggiungi manualmente

### 7.3 Crea Prima Newsletter
1. **Campaigns** → **Create Email Campaign**
2. Seleziona la tua lista
3. Usa il template creato
4. Invia o programma l'invio

---

## 🎉 RISULTATO FINALE

### ✅ Cosa Otterrai:
- 📧 **Email transazionali funzionanti**: Registrazione, reset password, notifiche
- 📰 **Sistema newsletter**: Per comunicazioni marketing
- 📊 **Analytics**: Tracking aperture e click
- 🔒 **Sicurezza**: SPF, DKIM configurati
- ⚡ **Alta deliverability**: Grazie a Brevo

### 📊 Email Giornaliere:
- **Gratuito**: 300 email/giorno
- **Newsletter**: Illimitate (con contatti illimitati)

---

## 🛠️ TROUBLESHOOTING

### Email non arrivano:
1. Verifica credenziali SMTP
2. Controlla record DNS SPF/DKIM
3. Controlla le cartelle spam

### Limite email superato:
- Piano gratuito: 300 email/giorno
- Upgrade a piano paid se necessario

### DNS non verifica:
- Attendi 24-48 ore per propagazione completa
- Verifica che i record siano corretti

---

**Tempo totale stimato**: 45-60 minuti ⏱️
**Difficoltà**: Media 🟡
**Costo**: GRATUITO 🆓 (fino a 300 email/giorno)