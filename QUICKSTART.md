# 🚀 Quick Start Guide - AgenzieCase

**Setup rapido per iniziare a lavorare sul progetto**

---

## ⚡ Primi Passi (5 min)

### 1. Clona e Installa
```bash
git clone <repo-url>
cd agenziecase

# Installa dipendenze
npm install
cd server && npm install && cd ..
```

### 2. Configura Environment
```bash
# Copia template
cp server/.env.example server/.env

# Modifica con le tue credenziali
nano server/.env
```

### 3. Avvia Database
```bash
# Assicurati che PostgreSQL sia in esecuzione
sudo service postgresql start  # Linux
brew services start postgresql # Mac
# Windows: avvia da Services

# Crea database
psql -U postgres
CREATE DATABASE agenziecase;
\q
```

### 4. Setup Database
```bash
cd server
npm run db:migrate
npm run db:seed
cd ..
```

### 5. Avvia Applicazione
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

### 6. Accedi
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/api/health

---

## 🛠️ Comandi Essenziali

### Development
```bash
npm run dev              # Avvia frontend dev server
cd server && npm run dev # Avvia backend dev server
npm run build            # Build frontend per produzione
npm run preview          # Preview build locale
```

### Testing
```bash
npm run test             # Run tutti i test
npm run test:watch       # Watch mode
npm run test:coverage    # Con coverage report
npm run test:unit        # Solo test unitari
npm run test:e2e         # Solo test e2e
```

### Code Quality
```bash
npm run lint             # Controlla problemi
npm run lint:fix         # Fix automatici
npm run format           # Formatta codice
```

### Database
```bash
cd server
npm run db:migrate       # Migrazioni
npm run db:seed          // Seed data
npm run db:reset         // Reset completo
npm run db:studio        // GUI database (se configurato)
```

---

## 📂 Struttura Progetto

```
agenziecase/
├── src/                          # Frontend React
│   ├── AgenzieCase.jsx           # App principale
│   ├── components/               # Componenti React
│   │   ├── CRMDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── PropertyCreateModal.jsx
│   │   └── ... (21+ components)
│   └── hooks/                    # Custom hooks
│       └── useVoice.js
│
├── server/                       # Backend Express
│   ├── models/                   # Modelli Sequelize (11)
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Client.js
│   │   └── ...
│   ├── routes/                   # API routes (16)
│   ├── controllers/              # Business logic
│   ├── middleware/               # Auth, upload, etc.
│   └── config/                   # Configurazioni
│
├── public/                       # Asset statici
├── uploads/                      # File uploadati
├── ROADMAP.md                    # Roadmap generale
├── TESTING.md                    # Strategia testing
├── SECURITY.md                   # Misure sicurezza
├── PERFORMANCE.md                # Ottimizzazioni
├── CODE_QUALITY.md               # Standard codice
├── DEPLOYMENT.md                 # Deployment strategy
├── DAILY_CHECKLIST.md            # Checklist giornaliera
└── QUICKSTART.md                 # Questo file
```

---

## 🔑 Funzionalità Chiave

### Per Utenti
- 🏠 Ricerca immobili con filtri avanzati
- 🤖 Chat AI assistente immobiliare
- ❤️ Salvataggio preferiti
- 👤 Profilo personale

### Per Agenti
- 👥 CRM completo (clienti, appuntamenti, trattative)
- 📊 Dashboard personalizzata
- 📝 Gestione attività
- 📄 Documenti e allegati

### Per Admin
- ⚙️ Gestione sistema
- 👥 Gestione utenti e ruoli
- 📈 Statistiche e report
- 🏢 Gestione partner

---

## 🐛 Troubleshooting Comune

### Porta già in uso
```bash
# Trova processo sulla porta 3001
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill processo
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Database connection error
```bash
# Verifica PostgreSQL sia attivo
sudo service postgresql status

# Verifica credenziali in .env
cat server/.env | grep DB_

# Test connessione
psql -U postgres -d agenziecase
```

### npm install fallisce
```bash
# Pulisci cache e reinstalla
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Frontend non si avvia
```bash
# Verifica Vite
npm install -g vite

# Reinstalla dipendenze frontend
rm -rf node_modules package-lock.json
npm install
```

### Backend non si avvia
```bash
# Verifica Node version (min 18)
node --version

# Reinstalla dipendenze backend
cd server
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Risorse Utili

### Documentazione
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Express Docs](https://expressjs.com/)
- [Sequelize Docs](https://sequelize.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### API Key Necessarie
```bash
# Richieste per funzionalità complete
ANTHROPIC_API_KEY=...      # AI chat
GOOGLE_CLOUD_KEY=...       # Text-to-speech
CLOUDINARY_URL=...         # Image upload
EMAIL_PASSWORD=...         # Email sending
```

### Utente Test (seed database)
```
Email: test@agenziecase.it
Password: Test123!
Role: Admin
```

---

## 🎯 Cosa Fare Dopo?

### Prima Priorità (vedi ROADMAP.md)
1. ⚠️ Implementa testing framework
2. 🔒 Aggiungi validazione input
3. 🚦 Setup rate limiting
4. 📝 Setup ESLint + Prettier

### Guarda Anche
- [DAILY_CHECKLIST.md](./DAILY_CHECKLIST.md) - Checklist giornaliera
- [ROADMAP.md](./ROADMAP.md) - Piano completo
- [TESTING.md](./TESTING.md) - Come implementare i test
- [SECURITY.md](./SECURITY.md) - Misure di sicurezza

---

## 💡 Tips Veloci

### Sviluppo Efficiente
- Usa `npm run dev:parallel` per avviare entrambi gli server
- Usa `npm run lint:fix` prima di commit
- Controlla `npm run test:coverage` settimanalmente

### Debug
- Usa `console.log` durante sviluppo
- Usa Chrome DevTools per frontend
- Usa Postman/Thunder Client per API testing
- Controlla logs in `server/logs/`

### Git Best Practices
- Committa spesso con messaggi chiari
- Fai pull prima di push
- Usa branch per nuove feature
- Non commitare `.env` file

---

**🚀 Sei pronto per iniziare! Controlla ROADMAP.md per il piano completo.**
