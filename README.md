# 🏠 AgenzieCase - Portale Immobiliare

Un portale immobiliare moderno con assistente AI powered by Claude.

## 🚀 Come avviare il progetto

### 1. Configura il Backend (per AI)

```bash
cd server
cp .env.example .env
# Modifica .env e inserisci la tua ANTHROPIC_API_KEY
npm install
npm start
```

> 💡 Ottieni la chiave API su https://console.anthropic.com

### 2. Avvia il Frontend

```bash
# Nella cartella principale
npm install
npm run dev
```

### 3. Apri nel browser
Vai su `http://localhost:5173`

---

## ✨ Funzionalità

- 🤖 **Chat AI con Claude** - Assistente intelligente per cercare immobili
- 🌙 **Design Dark Luxury** - Tema elegante nero e oro
- 🔍 **Filtri avanzati** - Slider interattivi per prezzo e superficie
- ❤️ **Sistema preferiti** - Salva i tuoi immobili preferiti
- 📊 **Classe energetica** - Badge colorati prominenti
- 🎬 **Animazioni fluide** - Micro-interazioni e hover effects
- 📱 **Responsive** - Ottimizzato per tutti i dispositivi
- 🔄 **Fallback offline** - Funziona anche senza server

---

## 📁 Struttura progetto

```
agenziecase-project/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   └── AgenzieCase.jsx
└── server/
    ├── package.json
    ├── index.js
    ├── .env.example
    └── .env          (da creare)
```

---

## 🛠️ Tecnologie

**Frontend:**
- React 18
- Vite
- CSS-in-JS (inline styles)
- Google Fonts (Playfair Display, DM Sans)

**Backend:**
- Node.js + Express
- Anthropic Claude API
- CORS

---

## 🔌 API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/chat` | POST | Chat con assistente AI |
| `/api/search` | POST | Ricerca AI immobili |
| `/api/health` | GET | Health check server |

---

## 💬 Cosa può fare l'AI

- Cercare immobili per città, tipo, prezzo
- Dare informazioni sul mercato immobiliare italiano
- Consigliare sulla scelta della casa
- Rispondere a domande su mutui, tasse, documenti
- Fornire stime di prezzo per zona

---

## ⚠️ Modalità Offline

Se il server non è attivo, il frontend funziona comunque con:
- Ricerca locale (filtri base)
- Risposte predefinite
- Indicatore "Offline" nella chat

---

## 💰 Costi API Claude

Claude API ha un costo per token:
- ~$0.003 per 1000 token input
- ~$0.015 per 1000 token output
- Una chat tipica costa ~$0.01-0.02

---

## 🚀 CI/CD

- **Deploy automatico** su push (branch main)
- **Test automatici** su ogni commit
- **Server:** Hetzner (178.104.183.66)
- **Ultimo test CI/CD:** 2026-05-07 (RSA Key)

---

## 📝 Prossimi sviluppi

- [ ] Database MongoDB/PostgreSQL
- [ ] Autenticazione utenti
- [ ] Upload immagini
- [ ] Mappa interattiva
- [ ] Notifiche real-time
- [ ] Dashboard agenzie

---

Creato con ❤️ per Max
