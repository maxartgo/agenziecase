# 🔧 Sentry Setup - Error Tracking Production

## 📋 Overview

Sentry è stato configurato per il monitoraggio errori in produzione su agenziecase.com.

## ✅ Componenti Configurati

### Backend (Node.js + Express)
- **File**: `server/sentry.cjs`
- **Pacchetto**: `@sentry/node`
- **Integrazione**: Attiva in `server/index.js`
- **Features**:
  - Error tracking automatici
  - Performance monitoring
  - Tracing automatico per le richieste HTTP
  - Filter dati sensibili (cookies, headers)
  - Database query tracing (PostgreSQL)

### Frontend (React)
- **File**: `src/sentry.client.cjs`
- **Pacchetti**: `@sentry/react`, `@sentry/tracing`
- **Integrazione**: Attiva in `src/main.jsx`
- **Features**:
  - Error tracking automatici
  - Session replay (errore utente)
  - Performance monitoring
  - Tracing automatico

---

## 🔑 Configurazione Sentry DSN

### 1. Crea un account Sentry
Vai su: https://sentry.io/auth/signup/

### 2. Crea un nuovo progetto
1. Clicca "Create Project"
2. Scegli "Node.js" come piattaforma
3. Nome progetto: `agenziecase-production`
4. Copia il **DSN** che ti viene fornito

### 3. Configura DSN su produzione

Nel file `.env.production` sul server:
```bash
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

---

## 🚀 Deploy con Sentry

### Step 1: Aggiorna il server

Connettiti al server e aggiorna il progetto:

```bash
ssh -i $env:USERPROFILE\.ssh\agenziecase_hetzner root@178.104.183.66
cd /var/www/agenziecase
git pull origin main
```

### Step 2: Ricostruisci e riavvia

```bash
docker compose down
docker compose up -d --build
```

### Step 3: Verifica

Dovresti vedere nei log:
```
✅ Sentry monitoring attivato
```

---

## 📊 Monitoraggio Errori

Dopo il deploy, gli errori verranno automaticamente tracciati su Sentry:

1. Vai su: https://sentry.io/
2. Seleziona il progetto `agenziecase-production`
3. Vedi errori in tempo reale

### Cosa viene tracciato:
- ✅ Errori del server (500, crash)
- ✅ Errori del frontend (React errors)
- ✅ Performance lenta
- ✅ Database query lente
- ✅ Errori autenticazione
- ✅ Errori API esterne

---

## 🔕 Protezione Dati Sensibili

Sentry è configurato per **NON** inviare:
- ❌ Cookies
- ❌ Headers
- ❌ Password
- query parameters sensibili

---

## 📈 Dashboard Sentry

Informazioni disponibili su Sentry:
- **Issues**: Lista errori con stack trace
- **Performance**: Metriche di performance
- **Transactions**: Tracing delle richieste
- **Users**: Utenti colpiti da errori
- **Releases**: Versioni deployate

---

## ⚙️ Configurazione Avanzata

### Sampling Rate
- **Tracing**: 20% in produzione (riduce costi)
- **Profiling**: 20% in produzione
- **Session Replay**: 10% errori

### Environment
- **Development**: Sentry disabilitato
- **Production**: Sentry attivo

---

## 🔧 Risoluzione Problemi

### Sentry non riceve errori
1. Verifica SENTRY_DSN in `.env.production`
2. Verifica che i pacchetti siano installati
3. Controlla i log container: `docker compose logs backend`

### Troppi errori
Riduci il sampling rate in `sentry.cjs`:
```javascript
tracesSampleRate: 0.1,  // 10% invece di 20%
```

---

## 📞 Supporto

Per problemi con Sentry:
- Documentazione: https://docs.sentry.io/
- Dashboard: https://sentry.io/

---

**Creato:** 2026-05-07
**Stato:** ⏳ Da configurare (manca SENTRY_DSN)
