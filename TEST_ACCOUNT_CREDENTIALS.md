# 🔑 Test Account Credentials - AgenzieCase CRM

## Stato Account Test

✅ **ACCOUNT CREATO CON SUCCESSO**

Il sistema ha dati parziali da un precedente tentativo di seeding. Il login funziona correttamente.

---

## 🔐 Credenziali Login

### Account Agente Test

```
Email:    test@agenziatest.it
Password: test123
Ruolo:    agent
User ID:  2
```

### JWT Token (valido per 7 giorni)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc2NTIyMDUzMiwiZXhwIjoxNzY1ODI1MzMyfQ.C6FlIEw8SFg7_EUWL6sL7SsAf7lHFFXqihFsMd1MnVw
```

---

## 🏢 Dati Agenzia (Partner)

```
Nome Agenzia:  Agenzia Immobiliare Test Milano
Partner ID:    1
Email:         info@agenziatest.it
Telefono:      +39 02 1234 5678
Indirizzo:     Via Giuseppe Garibaldi 45, Milano, MI 20121
P.IVA:         12345678901
Stato:         active
```

---

## 👤 Dati Utente/Agente

```
Nome:          Marco
Cognome:       Bianchi
Email:         test@agenziatest.it
Telefono:      +39 333 123 4567
Ruolo:         agent
Agent ID:      1
Partner ID:    1
Posizione:     Senior Real Estate Agent
```

---

## 🌐 Accesso al Sistema

### Frontend (React)
```
URL:      http://localhost:5173
Login:    Usa email e password sopra
```

### Backend API
```
URL Base: http://localhost:3001
Health:   GET  http://localhost:3001/api/health
Login:    POST http://localhost:3001/api/auth/login
```

---

## 🧪 Test Login via API

### 1. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@agenziatest.it","password":"test123"}'
```

**Risposta Attesa:**
```json
{
  "success": true,
  "message": "Login effettuato con successo",
  "token": "eyJhbGci...",
  "user": {
    "id": 2,
    "email": "test@agenziatest.it",
    "firstName": "Marco",
    "lastName": "Bianchi",
    "role": "agent"
  }
}
```

### 2. Verifica Profilo Utente
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 API CRM Disponibili

Tutte le chiamate richiedono l'header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Clienti
```bash
# Lista clienti del partner
GET http://localhost:3001/api/crm/clients?partnerId=1

# Crea nuovo cliente
POST http://localhost:3001/api/crm/clients
{
  "firstName": "Mario",
  "lastName": "Rossi",
  "email": "mario.rossi@email.it",
  "phone": "+39 340 1234567",
  "type": "buyer",
  "status": "new",
  "partnerId": 1,
  "agentId": 1
}

# Dettaglio cliente
GET http://localhost:3001/api/crm/clients/:id

# Statistiche clienti
GET http://localhost:3001/api/crm/clients/stats/1
```

### Appuntamenti
```bash
# Lista appuntamenti
GET http://localhost:3001/api/crm/appointments?partnerId=1

# Crea appuntamento
POST http://localhost:3001/api/crm/appointments
{
  "title": "Visita immobile",
  "type": "property_viewing",
  "startDate": "2025-12-10T10:00:00Z",
  "endDate": "2025-12-10T11:00:00Z",
  "location": "Via Roma 1, Milano",
  "clientId": 1,
  "agentId": 1,
  "partnerId": 1,
  "status": "scheduled"
}

# Calendario appuntamenti
GET http://localhost:3001/api/crm/appointments/calendar/1

# Statistiche appuntamenti
GET http://localhost:3001/api/crm/appointments/stats/1
```

### Trattative (Deals)
```bash
# Lista trattative
GET http://localhost:3001/api/crm/deals?partnerId=1

# Crea trattativa
POST http://localhost:3001/api/crm/deals
{
  "title": "Vendita Appartamento Centro",
  "type": "sale",
  "stage": "lead",
  "value": 350000,
  "probability": 50,
  "clientId": 1,
  "agentId": 1,
  "partnerId": 1,
  "status": "active"
}

# Sales Pipeline
GET http://localhost:3001/api/crm/deals/pipeline/1

# Statistiche trattative
GET http://localhost:3001/api/crm/deals/stats/1
```

### Attività
```bash
# Lista attività
GET http://localhost:3001/api/crm/activities?partnerId=1

# Crea attività
POST http://localhost:3001/api/crm/activities
{
  "type": "call",
  "description": "Chiamata follow-up cliente",
  "dueDate": "2025-12-09T15:00:00Z",
  "status": "pending",
  "priority": "high",
  "clientId": 1,
  "agentId": 1,
  "partnerId": 1
}

# Timeline attività
GET http://localhost:3001/api/crm/activities/timeline/1

# Tasks in scadenza
GET http://localhost:3001/api/crm/activities/tasks/1

# Statistiche attività
GET http://localhost:3001/api/crm/activities/stats/1
```

### Documenti
```bash
# Lista documenti
GET http://localhost:3001/api/crm/documents?partnerId=1

# Upload documento
POST http://localhost:3001/api/crm/documents/upload
(multipart/form-data con file + metadata)

# Download documento
GET http://localhost:3001/api/crm/documents/download/:id
```

---

## 🤖 AI-CRM Integration

### Chat AI con CRM
```bash
POST http://localhost:3001/api/ai-crm/chat
{
  "message": "Voglio vedere un appartamento a Milano",
  "context": {
    "partnerId": 1,
    "agentId": 1,
    "propertyId": 1
  }
}
```

### Crea Appuntamento da AI
```bash
POST http://localhost:3001/api/ai-crm/create-appointment
{
  "clientData": {
    "firstName": "Luca",
    "lastName": "Ferrari",
    "email": "luca@email.it",
    "phone": "+39 345 1112222"
  },
  "appointmentData": {
    "date": "2025-12-15T10:00:00Z",
    "type": "property_viewing",
    "propertyId": 1
  },
  "partnerId": 1,
  "agentId": 1
}
```

### Crea Lead da AI
```bash
POST http://localhost:3001/api/ai-crm/create-lead
{
  "clientData": {
    "firstName": "Sofia",
    "lastName": "Colombo",
    "email": "sofia@email.it",
    "phone": "+39 348 2223333",
    "type": "buyer",
    "budgetMin": 300000,
    "budgetMax": 450000
  },
  "partnerId": 1,
  "agentId": 1
}
```

### Calcola Mutuo
```bash
POST http://localhost:3001/api/ai-crm/calculate-mortgage
{
  "propertyPrice": 350000,
  "downPayment": 70000,
  "years": 30,
  "interestRate": 3.5
}
```

### Match Agenzia
```bash
POST http://localhost:3001/api/ai-crm/match-agency
{
  "propertyType": "apartment",
  "city": "Milano",
  "budget": 400000,
  "userLocation": "Milano, Porta Nuova"
}
```

---

## 📧 Communications API

### Conferma Appuntamento
```bash
POST http://localhost:3001/api/communications/send-appointment-confirmation
{
  "appointmentId": 1,
  "clientEmail": "client@email.it",
  "agentName": "Marco Bianchi",
  "agencyName": "Agenzia Test Milano"
}
```

### Conferma Lead
```bash
POST http://localhost:3001/api/communications/send-lead-confirmation
{
  "clientEmail": "client@email.it",
  "clientName": "Mario Rossi",
  "agencyName": "Agenzia Test Milano"
}
```

### Genera Link WhatsApp
```bash
POST http://localhost:3001/api/communications/generate-whatsapp-link
{
  "phone": "+39 333 1234567",
  "message": "Ciao! Sono interessato all'immobile..."
}
```

---

## 📝 Note Importanti

### ⚠️ Stato Attuale del Database

- **User**: ✅ Creato (ID: 2)
- **Partner**: ✅ Creato (ID: 1)
- **Agent**: ✅ Creato (ID: 1)
- **Clients**: ⚠️ Parzialmente creato (errore su query)
- **Appointments**: ❌ Non creati
- **Deals**: ❌ Non creati
- **Activities**: ❌ Non creati

### 🔧 Possibili Issue

1. **Client Query Error**: La query per recuperare i clienti ha un errore SQL relativo alla colonna `assignedAgent.firstName`. Questo indica che il join con la tabella agents potrebbe avere problemi.

2. **Database Schema**: Potrebbero esserci differenze tra lo schema previsto e quello effettivamente presente nel database.

### ✅ Cosa Funziona

- ✅ Login utente
- ✅ Autenticazione JWT
- ✅ Profilo utente
- ✅ Partner esiste nel DB
- ✅ Agent esiste nel DB
- ✅ Server backend attivo
- ✅ Frontend React attivo

### 🚀 Prossimi Passi Consigliati

1. **Fix Client Query**: Correggere l'errore nella query dei clienti in `server/routes/crm/clients.js`

2. **Creare Dati di Test**: Utilizzare l'API per creare manualmente alcuni:
   - Clienti (POST `/api/crm/clients`)
   - Appuntamenti (POST `/api/crm/appointments`)
   - Trattative (POST `/api/crm/deals`)
   - Attività (POST `/api/crm/activities`)

3. **Test Frontend**: Accedere al frontend e testare l'area CRM

---

## 🎯 Quick Test Commands

### Test Completo del Sistema
```bash
# 1. Health check
curl http://localhost:3001/api/health

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@agenziatest.it","password":"test123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 3. Get user profile
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Create test client
curl -X POST http://localhost:3001/api/crm/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Test",
    "lastName": "Cliente",
    "email": "test.cliente@email.it",
    "phone": "+39 340 9999999",
    "type": "buyer",
    "status": "new",
    "partnerId": 1,
    "agentId": 1
  }'
```

---

## 📚 Documentazione Aggiuntiva

Per informazioni complete su tutte le API e funzionalità, consulta:
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) - Log completo dello sviluppo
- [server/index.js](./server/index.js) - Lista di tutti gli endpoint
- [server/models/](./server/models/) - Struttura database

---

**Ultimo aggiornamento**: 2025-12-08
**Ambiente**: Development
**Backend**: http://localhost:3001
**Frontend**: http://localhost:5173
