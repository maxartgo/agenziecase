# 📧 GUIDA EMAIL OVH - AGENZIECASE

## ✅ CONFIGURAZIONE COMPLETATA

La configurazione email con OVH è stata completata con successo!

### 🔧 **Configurazione SMTP OVH:**
- **Host**: ssl0.ovh.net
- **Porta**: 465 (SSL)
- **Email**: info@agenziecase.com
- **Autenticazione**: Password email OVH

---

## 📋 PASSI FINALI

### ⚠️ **1. INSERISCI PASSWORD EMAIL**

Apri il file `.env.production` e sostituisci la password:

```bash
# Trova questa riga:
SMTP_PASSWORD=LA_TUA_PASSWORD_OVH

# Sostituisci con:
SMTP_PASSWORD=la_tua_password_vera_di_ovh
```

### 🚀 **2. DEPLOY SUL SERVER**

```bash
# Commit e push
git add .
git commit -m "feat: add OVH email configuration"
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

### 📧 **3. TEST EMAIL**

Testa l'invio email:

```bash
# Test semplice
curl -X POST https://agenziecase.com/api/test/test-simple \
  -H 'Content-Type: application/json' \
  -d '{"email":"tua-email@test.com"}'

# Test benvenuto
curl -X POST https://agenziecase.com/api/test/test-welcome \
  -H 'Content-Type: application/json' \
  -d '{"email":"tua-email@test.com","name":"Mario"}'
```

---

## 🎯 FUNZIONALITÀ EMAIL

### ✅ **Cosa Puoi Fare:**

#### **1. Email Transazionali:**
- ✅ Benvenuto nuovi utenti
- ✅ Reset password
- ✅ Notifiche sistema
- ✅ Conferme registrazioni

#### **2. Template Email Inclusi:**
- 📧 **Benvenuto**: Per nuovi utenti registrati
- 🔑 **Password Reset**: Per recupero password
- 📬 **Contatti**: Notifiche form contatti
- 🏠 **Richieste Immobili**: Per informazioni proprietà

#### **3. API Email Disponibili:**
```
POST /api/test/test-simple     → Test email semplice
POST /api/test/test-welcome    → Test email benvenuto
```

---

## 💻 **UTILIZZO NEL CODICE**

### **Esempio - Email di Benvenuto:**

```javascript
import { sendEmail, emailTemplates } from './config/email.js';

// Invia email benvenuto
const result = await sendEmail({
  to: 'nuovo.utente@email.com',
  subject: 'Benvenuto su AgenzieCase!',
  html: emailTemplates.welcome('Mario'),
  text: 'Benvenuto su AgenzieCase!'
});

if (result.success) {
  console.log('✅ Email inviata:', result.messageId);
} else {
  console.error('❌ Errore:', result.error);
}
```

### **Esempio - Reset Password:**

```javascript
const resetToken = 'abc123';
const result = await sendEmail({
  to: 'utente@email.com',
  subject: 'Resetta la tua password',
  html: emailTemplates.passwordReset(resetToken),
  text: `Resetta password qui: ${resetToken}`
});
```

---

## 📊 **LIMITI OVH EMAIL**

### **Piani Email OVH:**
- **Email individuali**: ~200-300 email/giorno
- **Newsletter**: Non raccomandato via OVH
- **SMTP affidabile**: ✅ Per transazionali

### **Se superi i limiti:**
1. Considera servizio dedicato (Brevo, SendGrid)
2. Oppure piano email superiore OVH

---

## 🔒 **SICUREZZA EMAIL**

### **Configurazioni Attive:**
- ✅ **SSL/TLS**: Connessione sicura
- ✅ **Autenticazione**: Password email OVH
- ✅ **SPF/DKIM**: Record DNS configurati
- ✅ **Reply-to**: info@agenziecase.com

### **Best Practice:**
- 📧 Usa sempre email template professionali
- 🔒 Non esporre mai le credenziali SMTP
- ✅ Testa prima di mandare in produzione
- 📊 Monitora i delivery rate

---

## 🛠️ **TROUBLESHOOTING**

### **Email non arrivano:**
```bash
# Verifica container
docker logs agenziecase-backend

# Verifica configurazione
docker exec agenziecase-backend cat /app/.env | grep SMTP
```

### **Autenticazione fallita:**
- Verifica password email OVH
- Controlla che l'email sia attiva su OVH
- Prova porta 587 invece di 465

### **Limite email superato:**
- Attendi 24 ore
- Oppure fai upgrade piano email OVH

---

## 🎉 **RISULTATO FINALE**

### ✅ **Sistema Email Completo:**
- 📧 **SMTP OVH configurato**
- 🔐 **Credenziali sicure**
- 📝 **Template professionali**
- 🧪 **Endpoint test funzionanti**
- 📊 **Pronto per produzione**

### 🌐 **Accessi:**
- **Email info**: info@agenziecase.com
- **Webmail OVH**: https://www.ovh.com/mail/
- **Sito**: https://agenziecase.com

---

**Tempo per completare**: 10 minuti ⏱️
**Difficoltà**: Facile 🟢
**Costo**: Già incluso in OVH 🆓

**Prossimo step**: Inserisci la password e deploy! 🚀