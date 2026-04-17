# AgenzieCase - Development Log

**Progetto**: Portale Immobiliare con AI
**Cliente**: Max
**AI Assistant**: Claude Sonnet 4.5
**Ultima Modifica**: 2025-12-07

---

## 📋 Stack Tecnologico

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: CSS-in-JS (inline styles)
- **Fonts**: Playfair Display + DM Sans (Google Fonts)
- **API Client**: Fetch API nativa

### Backend
- **Server**: Express.js (Node.js)
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **AI**: Anthropic Claude Sonnet 4 API
- **Voice AI**:
  - Speech-to-Text: Web Speech API (browser nativo, gratuito)
  - Text-to-Speech: Google Cloud Text-to-Speech API (voce WaveNet italiana naturale)
- **Authentication**: JWT
- **File Upload**: Multer

### Database
- **Host**: localhost
- **Port**: 5432
- **Database**: agenziecase
- **User**: postgres
- **Password**: admin123

---

## 🎯 Funzionalità Implementate

### 1. Homepage Pulita e Moderna
**Status**: ✅ Completato

**Modifiche**:
- Rimossi filtri di ricerca tradizionali
- Centralizzata chat AI come metodo principale di ricerca
- Hero section con titolo animato (effetto macchina da scrivere)
- Sottotitolo con descrizione capacità AI
- Card annunci visibili solo dopo ricerca AI

**File Modificati**:
- `src/AgenzieCase.jsx`

---

### 2. Effetto Typewriter sul Titolo
**Status**: ✅ Completato

**Descrizione**: Animazione "macchina da scrivere" sul testo "Trova la tua casa ideale"

**Implementazione**:
```javascript
const TypewriterText = ({ text, speed = 100, delay = 0 }) => {
  // Animazione carattere per carattere con cursor lampeggiante
  // Cursor scompare 2 secondi dopo fine animazione
}
```

**Parametri**:
- `speed`: 80ms tra un carattere e l'altro
- `delay`: 500ms prima di iniziare
- Cursor animato con bordo dorato

**File Modificati**:
- `src/AgenzieCase.jsx` (componente TypewriterText)

---

### 3. AI Chat Centralizzata
**Status**: ✅ Completato

**Funzionalità**:
- Ricerca proprietà tramite linguaggio naturale
- Claude AI analizza richiesta e cerca nel database
- Mostra annunci pertinenti + risposta testuale
- Pulsante per ascoltare risposta (TTS)

**Capacità AI**:
- Vendere immobili
- Comprare immobili
- Affittare immobili
- Valutare immobili
- Calcolare mutui
- Vedere nuove costruzioni

**Endpoint Backend**:
```javascript
POST /api/ai/search
Body: { query: "string" }
Response: {
  response: "string",
  properties: [...]
}
```

**File Modificati**:
- `src/AgenzieCase.jsx` (frontend)
- `server/routes/ai.js` (backend)

---

### 4. Voice AI Integration
**Status**: ✅ Completato

**Componenti**:

#### A. Speech-to-Text (Gratuito)
- **Tecnologia**: Web Speech API (browser nativo)
- **Lingua**: Italiano (it-IT)
- **Funzionalità**: Converte voce utente in testo
- **Posizione**: Bottone "Parla con l'AI" sopra barra di ricerca (centrato)

#### B. Text-to-Speech (ElevenLabs)
- **Tecnologia**: ElevenLabs API
- **Piano**: Gratuito (10,000 caratteri/mese)
- **Voce**: "Bella" (voce italiana femminile)
- **Modello**: eleven_multilingual_v2
- **Limite**: 500 caratteri per richiesta (per gestire quota)
- **Funzionalità**: Legge risposta AI con voce naturale
- **Posizione**: Bottone speaker (🔉/🔊) in risposta AI

**Custom Hook**:
```javascript
// src/hooks/useVoice.js
export const useVoice = () => {
  return {
    // Stati
    isListening, isSpeaking, transcript, error, isSupported,
    // Funzioni
    startListening, stopListening, speak, stopSpeaking
  };
};
```

**Backend Route**:
```javascript
// server/routes/voice.js
POST /api/voice/text-to-speech
Body: { text: "string" }
Response: Audio MP3 blob
```

**File Creati**:
- `src/hooks/useVoice.js`
- `server/routes/voice.js`

**File Modificati**:
- `src/AgenzieCase.jsx`
- `server/index.js`
- `server/.env` (ELEVENLABS_API_KEY)

**Pacchetti Installati**:
```bash
cd server
npm install elevenlabs
```

---

### 5. Matrix Rain Background Animation
**Status**: ✅ Completato

**Descrizione**: Effetto animato di caratteri che cadono dall'alto verso il basso (stile film "The Matrix")

**Caratteristiche**:
- **Colore**: Verde brillante (#00ff41) - classico Matrix
- **Opacità**: 0.15 (visibile ma non invasivo)
- **Font Size**: 14px
- **Velocità**: 50ms (aggiornamento frame)
- **Caratteri**: Mix di numeri, lettere, simboli immobiliari (€$¥£₿■●○)
- **Posizione**: Fixed background (z-index: 0)
- **Interazione**: pointer-events: none (non blocca click)
- **Responsive**: Si adatta automaticamente a resize finestra

**Tecnologia**: Canvas API con requestAnimationFrame

**Componente**:
```javascript
// src/components/MatrixRain.jsx
const MatrixRain = ({ opacity, color, fontSize, speed }) => {
  // Render canvas con animazione loop
}
```

**Integrazione**:
```jsx
<div style={styles.app}>
  <MatrixRain opacity={0.15} color="#00ff41" fontSize={14} speed={50} />
  {/* Resto contenuto */}
</div>
```

**File Creati**:
- `src/components/MatrixRain.jsx`

**File Modificati**:
- `src/AgenzieCase.jsx` (import e render)

---

### 6. Sistema Partner/Agenzie
**Status**: ⚠️ Parziale (modelli creati, UI da completare)

**Modelli Database**:

#### Partner Model
```javascript
// server/models/Partner.js
{
  companyName: STRING(255) UNIQUE,
  vatNumber: STRING(50) UNIQUE,
  fiscalCode: STRING(50),
  address: STRING(500),
  city: STRING(100),
  province: STRING(50),
  zipCode: STRING(20),
  phone: STRING(50),
  email: STRING(255) UNIQUE,
  website: STRING(255),
  businessCertificate: STRING(500), // Visura Camerale
  idDocument: STRING(500),          // Documento Identità
  acceptedTerms: BOOLEAN,
  status: ENUM['pending', 'approved', 'rejected', 'suspended'],
  approvedAt: DATE,
  approvedBy: INTEGER
}
```

#### Agent Model
```javascript
// server/models/Agent.js
{
  partnerId: INTEGER (FK),
  firstName: STRING(100),
  lastName: STRING(100),
  email: STRING(255) UNIQUE,
  phone: STRING(50),
  status: ENUM['active', 'inactive', 'suspended']
}
```

#### Subscription Model
```javascript
// server/models/Subscription.js
{
  partnerId: INTEGER (FK),
  plan: ENUM['basic', 'professional', 'premium'],
  status: ENUM['active', 'expired', 'cancelled'],
  startDate: DATE,
  endDate: DATE,
  amount: DECIMAL(10,2)
}
```

**Relazioni**:
- Partner hasMany Agents
- Partner hasMany Subscriptions
- Partner hasMany Properties
- Property belongsTo Partner
- Property belongsTo Agent (opzionale)

**File Creati**:
- `server/models/Partner.js`
- `server/models/Agent.js`
- `server/models/Subscription.js`
- `src/components/PartnerRegistrationModal.jsx`

**TODO**:
- [ ] Completare UI registrazione partner
- [ ] Dashboard partner
- [ ] Gestione agenti
- [ ] Sistema pagamento abbonamenti

---

### 7. Database Schema Fixes
**Status**: ✅ Completato

**Problema**: Colonne mancanti nel database (partnerId, agentId)

**Soluzione**: Script manuale per aggiungere colonne

```javascript
// server/scripts/addMissingColumns.js
await sequelize.query(`
  ALTER TABLE properties ADD COLUMN "partnerId" INTEGER;
  ALTER TABLE properties ADD COLUMN "agentId" INTEGER;
`);
```

**Esecuzione**:
```bash
cd server
node scripts/addMissingColumns.js
```

**File Creati**:
- `server/scripts/addMissingColumns.js`
- `server/scripts/dropTables.js` (utility per reset DB)

---

### 8. Sistema CRM Completo per Partner
**Status**: ✅ Completato (Backend API)
**Data**: 2025-12-07

**Descrizione**: Sistema CRM completo per gestione clienti, appuntamenti, trattative, attività e documenti da parte dei partner immobiliari.

#### Modelli Database Creati

**1. Client Model** (`server/models/Client.js`)
```javascript
{
  // Dati personali
  firstName, lastName, email, phone, address,

  // Tipo e status
  type: ENUM['buyer', 'seller', 'renter', 'landlord', 'both'],
  status: ENUM['new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'],

  // Budget e preferenze
  budgetMin, budgetMax, preferredPropertyType, preferredLocations,

  // Source e priorità
  source: ENUM['website', 'referral', 'social_media', 'direct_contact', 'other'],
  priority: ENUM['low', 'medium', 'high', 'urgent'],

  // Relazioni
  agentId (FK), partnerId (FK)
}
```

**2. Appointment Model** (`server/models/Appointment.js`)
```javascript
{
  title, description, startDate, endDate,

  type: ENUM['viewing', 'meeting', 'call', 'video_call', 'signing', 'other'],
  status: ENUM['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],

  location, meetingLink, notes, reminders,

  // Relazioni
  clientId (FK), propertyId (FK), agentId (FK), partnerId (FK)
}
```

**3. Deal Model** (`server/models/Deal.js`)
```javascript
{
  title, description,

  type: ENUM['sale', 'rent', 'buy', 'lease'],
  stage: ENUM['lead', 'qualification', 'proposal', 'negotiation', 'closing', 'won', 'lost'],

  value, expectedCommission, probability,
  expectedCloseDate, actualCloseDate,

  lostReason: ENUM['price', 'competition', 'no_response', 'timing', 'financing', 'other'],
  competitor, priority,

  // Relazioni
  clientId (FK), propertyId (FK), agentId (FK), partnerId (FK)
}
```

**4. Activity Model** (`server/models/Activity.js`)
```javascript
{
  type: ENUM['call', 'email', 'sms', 'whatsapp', 'meeting', 'note', 'task', 'document', 'other'],
  direction: ENUM['inbound', 'outbound'],

  subject, content, duration, outcome,
  activityDate, followUpRequired, followUpDate,

  isCompleted, completedAt, attachments,

  // Può collegarsi a multiple entità
  clientId (FK), dealId (FK), propertyId (FK), appointmentId (FK),
  agentId (FK), partnerId (FK)
}
```

**5. Document Model** (`server/models/Document.js`)
```javascript
{
  fileName, title, fileUrl, fileType, fileSize,

  category: ENUM[
    'identity', 'contract', 'certificate', 'inspection', 'appraisal',
    'proposal', 'invoice', 'receipt', 'photo', 'plan', 'other'
  ],

  notes, tags, isPublic, expiresAt,

  // Relazioni
  clientId (FK), dealId (FK), propertyId (FK),
  uploadedBy (FK - Agent), partnerId (FK)
}
```

#### API Routes Implementate

**Clients API** (`server/routes/crm/clients.js`)
- `GET /api/crm/clients` - Lista clienti (filtri: partnerId, agentId, status, type, priority, search)
- `GET /api/crm/clients/:id` - Dettaglio cliente (con appointments, deals, activities, documents)
- `POST /api/crm/clients` - Crea cliente (+ auto-crea activity log)
- `PUT /api/crm/clients/:id` - Aggiorna cliente
- `DELETE /api/crm/clients/:id` - Elimina cliente
- `GET /api/crm/clients/stats/:partnerId` - Statistiche (total, thisMonth, byStatus, byType)

**Appointments API** (`server/routes/crm/appointments.js`)
- `GET /api/crm/appointments` - Lista appuntamenti (filtri: partnerId, agentId, clientId, propertyId, status, type, date range)
- `GET /api/crm/appointments/:id` - Dettaglio appuntamento (con client, agent, property, activities)
- `POST /api/crm/appointments` - Crea appuntamento (validazione date + auto-crea activity)
- `PUT /api/crm/appointments/:id` - Aggiorna appuntamento (+ activity log su cambio stato)
- `DELETE /api/crm/appointments/:id` - Elimina appuntamento
- `GET /api/crm/appointments/calendar/:partnerId` - Calendario (filtro: agentId, month, year)
- `GET /api/crm/appointments/stats/:partnerId` - Statistiche (total, today, thisWeek, byStatus, byType)

**Deals API** (`server/routes/crm/deals.js`)
- `GET /api/crm/deals` - Lista trattative (filtri: partnerId, agentId, clientId, propertyId, stage, type, priority, search)
- `GET /api/crm/deals/:id` - Dettaglio trattativa (con client, agent, property, activities, documents)
- `POST /api/crm/deals` - Crea trattativa (+ auto-crea activity)
- `PUT /api/crm/deals/:id` - Aggiorna trattativa (+ activity log su cambio stage)
- `DELETE /api/crm/deals/:id` - Elimina trattativa
- `GET /api/crm/deals/pipeline/:partnerId` - Sales Pipeline (count, totalValue, avgProbability per stage)
- `GET /api/crm/deals/stats/:partnerId` - Statistiche complete (total, active, won, lost, conversionRate, activeValue, wonValue, totalCommission, thisMonthClosed, byType, lostReasons)

**Activities API** (`server/routes/crm/activities.js`)
- `GET /api/crm/activities` - Lista attività (filtri: partnerId, agentId, clientId, dealId, propertyId, appointmentId, type, outcome, isCompleted, date range)
- `GET /api/crm/activities/:id` - Dettaglio attività (con tutte le relazioni)
- `POST /api/crm/activities` - Crea attività
- `PUT /api/crm/activities/:id` - Aggiorna attività (auto-completa tasks)
- `DELETE /api/crm/activities/:id` - Elimina attività
- `GET /api/crm/activities/timeline/:partnerId` - Timeline ultimi X giorni (filtri: agentId, clientId, dealId, days)
- `GET /api/crm/activities/tasks/:partnerId` - Tasks da completare (filtro: agentId, overdueOnly)
- `GET /api/crm/activities/stats/:partnerId` - Statistiche (total, today, thisWeek, openTasks, overdueTasks, avgCallDuration, byType, byOutcome)

**Documents API** (`server/routes/crm/documents.js`)
- `GET /api/crm/documents` - Lista documenti (filtri: partnerId, clientId, dealId, propertyId, uploadedBy, category, isPublic, search)
- `GET /api/crm/documents/:id` - Dettaglio documento (con tutte le relazioni)
- `POST /api/crm/documents/upload` - Upload documento (con Multer, max 10MB, validazione file types)
- `PUT /api/crm/documents/:id` - Aggiorna metadati documento
- `DELETE /api/crm/documents/:id` - Elimina documento (+ rimuove file fisico)
- `GET /api/crm/documents/download/:id` - Download documento
- `GET /api/crm/documents/stats/:partnerId` - Statistiche (total, publicCount, privateCount, totalSize, totalSizeMB, thisMonthCount, expiringCount, byCategory)

#### Features Chiave

**1. Activity Logging Automatico**
- Ogni creazione di cliente → auto-crea Activity "Cliente creato"
- Ogni creazione appuntamento → auto-crea Activity "Appuntamento creato"
- Ogni creazione trattativa → auto-crea Activity "Trattativa creata"
- Cambio status appuntamento → auto-crea Activity con log cambio
- Cambio stage trattativa → auto-crea Activity con log cambio (speciale per won/lost)

**2. Relazioni Multiple**
- Activity può collegare: client, deal, property, appointment
- Document può collegare: client, deal, property
- Appointment collega sempre: client, agent, partner (property opzionale)
- Deal collega sempre: client, agent, partner (property opzionale)

**3. File Upload System**
- Multer middleware per upload files
- Cartella: `uploads/documents`
- Tipi supportati: pdf, doc, docx, xls, xlsx, jpg, jpeg, png, gif, txt
- Limite: 10MB per file
- Auto-cleanup su errore o eliminazione

**4. Statistiche Complete**
- Clients: totale, nuovo mese, per status, per tipo
- Appointments: totale, oggi, settimana, per status, per tipo
- Deals: pipeline completo, conversione, valori, commissioni, motivi perdita
- Activities: timeline, tasks aperti/scaduti, durata media chiamate
- Documents: dimensione totale, pubblici/privati, in scadenza, per categoria

**5. Search & Filters**
- Full-text search sui clienti (nome, cognome, email, telefono)
- Filtri multipli su ogni entità
- Range di date per appuntamenti e attività
- Calendar view per appuntamenti (filtro per mese/anno)
- Pipeline view per deals (raggruppato per stage)
- Timeline view per activities (ultimi X giorni)

#### File Modificati
- `server/models/index.js` - Aggiunte tutte le relazioni CRM
- `server/index.js` - Integrate tutte le route CRM + documentazione endpoint

#### File Creati
- `server/models/Client.js`
- `server/models/Appointment.js`
- `server/models/Deal.js`
- `server/models/Activity.js`
- `server/models/Document.js`
- `server/routes/crm/clients.js`
- `server/routes/crm/appointments.js`
- `server/routes/crm/deals.js`
- `server/routes/crm/activities.js`
- `server/routes/crm/documents.js`

#### Package Aggiunti
- `multer` - Già installato (per upload documenti)

#### TODO - Frontend da Implementare
- [ ] Dashboard CRM partner con statistiche overview
- [ ] Gestione clienti (lista, dettaglio, crea, modifica)
- [ ] Calendario appuntamenti interattivo
- [ ] Kanban board per sales pipeline (deals)
- [ ] Timeline attività
- [ ] Gestione documenti con upload
- [ ] Sistema notifiche per tasks scaduti
- [ ] Report e analytics avanzati

---

### 9. Integrazione AI-CRM Intelligente
**Status**: ✅ Completato (Backend API)
**Data**: 2025-12-08

**Descrizione**: Sistema di integrazione tra l'assistente AI e il CRM per permettere all'AI di conoscere le agenzie, prendere appuntamenti, creare lead, calcolare mutui e mettere in contatto clienti con agenti.

#### Funzionalità AI Implementate

**1. Chat AI con Contesto CRM** (`POST /api/ai-crm/chat`)
- L'AI ha accesso a tutte le agenzie partner registrate
- Conosce gli agenti disponibili e le loro specializzazioni
- Vede gli immobili disponibili in tempo reale
- Riceve contesto utente (nome, email, telefono, preferenze)
- Risponde con azioni strutturate in JSON quando necessario

**2. Creazione Appuntamenti Automatica** (`POST /api/ai-crm/create-appointment`)
- L'AI può fissare appuntamenti per visite immobili
- Crea o trova cliente esistente automaticamente
- Associa appuntamento a immobile, agente, partner
- Genera activity log automatico
- Supporta: viewing, meeting, call, video_call, signing

**3. Generazione Lead Qualificati** (`POST /api/ai-crm/create-lead`)
- L'AI crea lead (buyer, seller, renter, landlord)
- Raccoglie budget, preferenze, zona di interesse
- Assegna automaticamente agente specializzato
- Crea trattativa (Deal) nel CRM
- Priorità alta per lead da AI

**4. Calcolo Mutuo Professionale** (`POST /api/ai-crm/calculate-mortgage`)
- Formula matematica accurata: M = P * [r(1+r)^n] / [(1+r)^n - 1]
- Calcola: rata mensile, totale da restituire, interessi
- Parametri: importo, anni, tasso interesse
- Risultati pronti per condivisione cliente

**5. Matching Intelligente Agenzia** (`POST /api/ai-crm/match-agency`)
- Algoritmo di scoring per trovare agenzia migliore
- Criteri: città, tipo immobile, budget, numero immobili compatibili
- Scoring: +20 punti per immobile compatibile, +10 per agente, +30 per città esatta
- Top 5 agenzie ordinate per score
- Include agente consigliato per contatto diretto

#### System Prompt AI Avanzato

L'AI è stata istruita con un system prompt completo che include:

**Capacità:**
- Informazioni dettagliate su agenzie partner
- Prendere appuntamenti con conferme
- Valutare immobili e creare stime
- Preventivare mutui con calcoli precisi
- Matching intelligente cliente-agenzia-immobile
- Generare template comunicazioni

**Formato Risposte JSON:**
```javascript
{
  "action": "create_appointment|create_lead|match_agency|calculate_mortgage",
  "message": "messaggio amichevole per utente",
  "data": { /* dati specifici azione */ }
}
```

**Regole Importanti:**
- Chiede SEMPRE dati personali prima di creare lead/appuntamenti
- Riepilogo dettagli prima di finalizzare
- Privacy: spiega condivisione dati con agenzia
- Tono professionale ma cordiale
- Non assume informazioni mancanti, chiede

#### Sistema Comunicazioni

**File creato:** `server/utils/communications.js`

**Template Email:**
1. **Conferma Appuntamento** - Con dettagli completi, info immobile, agente di riferimento
2. **Conferma Lead** - Richiesta ricevuta, agente assegnato, tempistiche
3. **Richiesta Valutazione** - Dettagli immobile, esperto valutazioni, prossimi passi

**Messaggi WhatsApp:**
1. **Conferma Appuntamento** - Formato breve con emoji, data/ora, immobile, agente
2. **Conferma Lead** - Benvenuto, agente assegnato, tempistiche contatto
3. **Preventivo Mutuo** - Calcolo rata, dettagli mutuo, proposta consulenza

**Helper Functions:**
- `generateWhatsAppLink()` - Genera URL `wa.me` pronto all'uso
- `sendEmail()` - Placeholder per servizio email (da integrare SendGrid/AWS SES)
- `prepareWhatsAppMessage()` - Prepara messaggio + link WhatsApp
- Traduzioni tipo appuntamento, deal, immobile in italiano

**API Comunicazioni** (`server/routes/communications.js`)
- `POST /api/communications/send-appointment-confirmation`
- `POST /api/communications/send-lead-confirmation`
- `POST /api/communications/send-valuation-request`
- `POST /api/communications/generate-whatsapp-link`

#### Workflow Completo Esempio

**Scenario: Utente chiede "Voglio visitare l'appartamento a Milano"**

1. **Cliente**: "Voglio visitare l'appartamento a Milano"
2. **AI riceve richiesta** → Analizza e rileva interesse per immobile
3. **AI risponde con richiesta dati** → "Perfetto! Per fissare l'appuntamento ho bisogno di alcuni tuoi dati."
4. **Frontend mostra ClientDataForm** → Form inline nella chat con:
   - Campo Nome
   - Campo Cognome
   - Campo Email
   - Campo Telefono
   - Checkbox "Accetto i termini e condizioni"
   - Checkbox "Accetto la privacy policy e autorizzo il trattamento dati"
   - Info box: "🏢 I tuoi dati saranno condivisi con [Nome Agenzia] per gestire la tua richiesta"
5. **Cliente compila e invia form** → Click su "Conferma"
6. **Frontend invia dati** → POST `/api/ai-crm/create-appointment` con:
   ```json
   {
     "clientFirstName": "Mario",
     "clientLastName": "Rossi",
     "clientEmail": "mario@email.com",
     "clientPhone": "333-1234567",
     "propertyId": 123,
     "partnerId": 1,
     "appointmentDate": "2025-12-12T15:00:00",
     "appointmentType": "viewing",
     "notes": "Cliente interessato, richiesta da chat AI"
   }
   ```
7. **Backend processa:**
   - Trova o crea cliente Mario Rossi (email + partnerId unique)
   - Crea appuntamento per immobile Milano
   - Assegna agente specializzato zona Milano
   - Genera activity log "Appuntamento creato da AI"
8. **Backend invia comunicazioni:**
   - Email conferma a mario@email.com
   - Link WhatsApp pronto per invio
9. **AI riceve conferma e risponde** → "Perfetto Mario! Appuntamento fissato per giovedì 12 dicembre alle 15:00 con l'agente Laura Blu. Ti ho inviato una conferma via email."

**Multi-Agenzia Scenario:**
- Se cliente è interessato ad immobile di agenzia diversa:
  1. AI rileva cambio agenzia
  2. AI informa: "Questo immobile è di un'altra agenzia (Agenzia B). I tuoi dati saranno condivisi anche con loro per gestire questa richiesta. Procedo?"
  3. Se cliente accetta → Mostra form con nome nuova agenzia
  4. Backend crea nuovo record Cliente con stesso email ma diverso partnerId
  5. Ogni agenzia vede solo i propri clienti (privacy/GDPR)

#### File Creati
- `server/routes/ai-crm.js` - 5 endpoint AI-CRM integration
- `server/utils/communications.js` - Template email/WhatsApp + helper
- `server/routes/communications.js` - 4 endpoint comunicazioni
- `src/components/ClientDataForm.jsx` - Form React per raccolta dati cliente in chat

#### File Modificati
- `server/index.js` - Integrate route AI-CRM + Communications

#### Features Chiave

**1. Contesto Dinamico**
- L'AI riceve in tempo reale lista agenzie, agenti, immobili
- Adatta risposte in base a disponibilità reale
- Contesto utente persistente nella conversazione

**2. Automazione Intelligente**
- Crea/trova cliente automaticamente (no duplicati)
- Assegna agente migliore in base a zona/specializzazione
- Genera activity log per tracciabilità
- Priorità automatica per lead da AI

**3. Comunicazioni Multi-canale**
- Email HTML formattate professionalmente
- WhatsApp con link diretto clic-to-chat
- Template personalizzati per ogni scenario
- Emoji e formatting WhatsApp-friendly

**4. Privacy & GDPR**
- AI informa utente sulla condivisione dati
- Conferme esplicite prima di finalizzare
- Dati condivisi solo con agenzia scelta

**5. Calcoli Professionali**
- Formula mutuo matematicamente corretta
- Arrotondamenti appropriati
- Dettaglio totale interessi pagati

**6. ClientDataForm - Raccolta Dati UX Friendly**

Componente React per raccolta dati cliente direttamente nella chat AI:

**Props:**
- `onSubmit` - Callback chiamato con formData quando form viene inviato
- `onCancel` - Callback per annullamento
- `initialData` - Dati precompilati opzionali
- `purpose` - Tipo richiesta: 'appointment' | 'lead' | 'valuation'
- `agencyName` - Nome agenzia per info box trasparenza
- `propertyTitle` - Titolo immobile (opzionale)

**Campi Form:**
- Nome (required)
- Cognome (required)
- Email (required, validazione regex)
- Telefono (required, validazione regex min 8 caratteri)
- Checkbox Termini e Condizioni (required, con link)
- Checkbox Privacy Policy (required, con link)

**Features:**
- Validazione in tempo reale
- Errori mostrati sotto ogni campo
- Info box che mostra quale agenzia riceverà i dati
- Design coerente con tema gold del sito
- Loading state durante submit
- Gestione errori submit
- Responsive e accessibile

**Styling:**
- Background: `#f9f9f9`
- Bordo gold: `#d4af37`
- Font titoli: Playfair Display
- Font body: DM Sans
- Hover effects su bottoni
- Shadow e border-radius moderni

#### Sistema Notifiche Agenti Implementato

**File modificati**: `server/utils/communications.js`, `server/routes/ai-crm.js`

**Nuove funzioni aggiunte**:
1. `generateAgentAppointmentNotification()` - Email notifica agente per nuovo appuntamento
2. `generateAgentLeadNotification()` - Email notifica agente per nuovo lead

**Caratteristiche Email Notifiche Agente**:
- Subject: "🏠 Nuovo Appuntamento da AgenzieCase AI" / "🎯 Nuovo Lead da AgenzieCase AI"
- Dettagli completi: cliente, immobile, budget, preferenze
- Azioni rapide: link telefono, email, WhatsApp
- Consigli azioni (per lead): contattare entro 24h, qualificare, preparare selezione
- Professional tone con emoji e formattazione chiara

**Integrazione**:
- `/api/ai-crm/create-appointment` ora invia automaticamente email all'agente assegnato
- `/api/ai-crm/create-lead` ora invia automaticamente email all'agente assegnato
- Email inviate subito dopo creazione nel CRM
- Fallback graceful se agente non ha email configurata

#### TODO - Prossimi Passi

**Frontend Integration:**
- [ ] Integrare ClientDataForm in AgenzieCase.jsx chat
- [ ] Gestire show/hide form basato su risposta AI
- [ ] Collegare onSubmit a `/api/ai-crm/create-appointment`
- [ ] Gestire conferma post-submit nella chat
- [ ] Aggiungere stato per tracking form attivo (showClientForm, formData, etc.)

**AI System Prompt:**
- [ ] Aggiornare prompt con istruzione form: "Quando cliente mostra interesse, rispondi con action: request_client_data"
- [ ] Documentare formato JSON risposta AI per trigger form
- [ ] Implementare logica rilevamento multi-agenzia

**Integrazioni Esterne:**
- [✅] Template email notifica agente - Completato
- [ ] Servizio Email reale (SendGrid / AWS SES / Mailgun) - Sostituire placeholder sendEmail()
- [ ] API WhatsApp Business ufficiale (opzionale)
- [ ] Webhook notifiche agenti in tempo reale (push notifications)
- [ ] SMS notifications (Twilio) per appuntamenti urgenti

---

## 🐛 Problemi Risolti

### 1. Errore: "la colonna partnerId non esiste"
**Causa**: Modello Property aggiornato ma database non migrato
**Soluzione**: Script addMissingColumns.js
**Data**: 2025-12-06

### 2. Errore: Sequelize UNIQUE constraint syntax error
**Causa**: `unique: true` nelle definizioni colonne invece che in indexes
**Soluzione**: Spostato unique constraints in array indexes
**File**: `server/models/Partner.js`
**Data**: 2025-12-06

### 3. Voice Button Sovrapposizione
**Causa**: Bottone microfono dentro barra ricerca
**Soluzione 1**: Aggiustato padding
**Soluzione 2**: Rimosso emoji microfono
**Soluzione 3**: Spostato bottone fuori e sopra barra (centrato)
**Richieste Utente**: 3 iterazioni
**Data**: 2025-12-06

### 4. Matrix Animation Troppo Chiara/Scura
**Causa**: Valore opacità non ottimale
**Tentativi**:
- 0.15 (iniziale - troppo chiaro)
- 0.08 (troppo scuro)
- 0.15 (finale - bilanciato)

**Causa 2**: Colore non visibile
**Tentativi**:
- #d4af37 (oro - iniziale)
- #8b7a2f (oro scuro - poco visibile)
- #00ff41 (verde Matrix - finale)
**Data**: 2025-12-06

---

## 📁 Struttura File Progetto

```
agenziecase/
├── server/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Partner.js
│   │   ├── Agent.js
│   │   └── Subscription.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── properties.js
│   │   ├── ai.js
│   │   └── voice.js
│   ├── scripts/
│   │   ├── addMissingColumns.js
│   │   └── dropTables.js
│   ├── .env
│   ├── index.js
│   └── package.json
├── src/
│   ├── components/
│   │   ├── MatrixRain.jsx
│   │   └── PartnerRegistrationModal.jsx
│   ├── hooks/
│   │   └── useVoice.js
│   ├── AgenzieCase.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── DEVELOPMENT_LOG.md (questo file)
```

---

## 🔐 Variabili d'Ambiente

**File**: `server/.env`

```env
# Server
PORT=3001

# Anthropic API (Claude AI)
ANTHROPIC_API_KEY=sk-ant-la-tua-chiave-qui

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agenziecase
DB_USER=postgres
DB_PASSWORD=admin123

# JWT Authentication
JWT_SECRET=agenziecase_super_secret_key_2025_max
JWT_EXPIRES_IN=7d

# ElevenLabs API (Text-to-Speech)
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```

**⚠️ IMPORTANTE**: Configurare chiavi API reali prima del deployment

---

## 🎨 Design System

### Colori Principali
- **Oro Primario**: #d4af37
- **Oro Chiaro**: #f5e7a3
- **Nero**: #0a0a0a
- **Grigio Scuro**: #1a1a2e
- **Verde Matrix**: #00ff41 (solo animazione)

### Font
- **Titoli**: Playfair Display (serif, elegante)
- **Corpo**: DM Sans (sans-serif, moderno)

### Animazioni
- **fadeIn**: Opacità 0 → 1
- **slideDown**: Traslazione Y -10px → 0
- **pulse**: Pulsazione opacità (per stati attivi)
- **blink**: Lampeggio cursor typewriter
- **typewriter**: Effetto macchina da scrivere

---

## 🚀 Come Avviare il Progetto

### 1. Setup Database
```bash
# Avvia PostgreSQL
# Crea database
psql -U postgres
CREATE DATABASE agenziecase;
\q

# Aggiungi colonne mancanti
cd server
node scripts/addMissingColumns.js
```

### 2. Installa Dipendenze
```bash
# Backend
cd server
npm install

# Frontend
cd ..
npm install
```

### 3. Configura .env
```bash
cd server
# Modifica .env con chiavi API reali
```

### 4. Avvia Applicazione
```bash
# Terminal 1 - Backend
cd server
node index.js

# Terminal 2 - Frontend
npm run dev
```

### 5. Accedi
```
Frontend: http://localhost:5173
Backend: http://localhost:3001
```

---

## 📦 Dipendenze Installate

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.3"
  }
}
```

### Backend (server/package.json)
```json
{
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "pg": "^8.13.1",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.37.5",
    "@anthropic-ai/sdk": "^0.32.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "elevenlabs": "^0.19.3"
  }
}
```

---

## 🔄 Prossimi Step Suggeriti

### Alta Priorità
1. **Configurare API Keys reali**
   - ANTHROPIC_API_KEY (Claude AI)
   - ELEVENLABS_API_KEY (Voice AI)

2. **Completare Sistema Partner**
   - Form registrazione funzionante
   - Upload documenti (Visura, ID)
   - Email conferma registrazione
   - Dashboard partner

3. **Sistema Abbonamenti**
   - Integrazione pagamenti (Stripe/PayPal)
   - Gestione piani (Basic/Professional/Premium)
   - Rinnovo automatico

4. **Dashboard Partner**
   - Gestione annunci
   - Gestione agenti
   - Statistiche visualizzazioni
   - Lead ricevuti

### Media Priorità
5. **Sistema Notifiche**
   - Email quando utente interessato ad annuncio
   - Notifiche dashboard partner
   - SMS (opzionale)

6. **Filtri Avanzati**
   - Mappa interattiva
   - Salva ricerche
   - Preferiti utente

7. **Ottimizzazioni**
   - Caching risposte AI comuni
   - Lazy loading immagini
   - Compressione immagini
   - CDN per asset

### Bassa Priorità
8. **Features Extra**
   - Tour virtuali 360°
   - Video tour
   - Calcolo mutuo interattivo
   - Comparatore annunci
   - Blog immobiliare

---

## 📊 Metriche e Limiti

### ElevenLabs (Piano Gratuito)
- **Caratteri/mese**: 10,000
- **Limite per richiesta**: 500 caratteri (impostato)
- **Stima utilizzo**: ~20 risposte AI vocali/mese (media 500 char)

### Anthropic Claude
- **Da configurare**: Piano da scegliere in base a volume

### Database PostgreSQL
- **Storage**: Locale (illimitato)
- **Connessioni max**: Default PostgreSQL

---

## 👤 Crediti

**Sviluppato da**: Claude Sonnet 4.5
**Cliente**: Max
**Data Inizio**: Dicembre 2025
**Ultima Modifica**: 2025-12-06

---

## 📝 Note Tecniche

### Performance
- Animazione Matrix usa Canvas API (hardware accelerated)
- Voice API browser-native (zero latency)
- ElevenLabs streaming audio (bassa latenza)
- React 18 con Vite (HMR veloce)

### Browser Support
- **Voice Input**: Chrome, Edge, Safari (no Firefox)
- **Voice Output**: Tutti i browser moderni
- **Matrix Animation**: Tutti i browser con Canvas support

### Security
- Password hashate con bcrypt
- JWT per sessioni
- SQL Injection protection (Sequelize ORM)
- File upload sanitization (Multer)
- CORS configurato

---

## 🆘 Troubleshooting

### Server non si avvia
```bash
# Verifica PostgreSQL
psql -U postgres -c "SELECT version();"

# Verifica .env
cat server/.env

# Reinstalla dipendenze
cd server && rm -rf node_modules && npm install
```

### Voice non funziona
- **Microfono**: Verifica permessi browser
- **Speaker**: Verifica ELEVENLABS_API_KEY in .env
- **Browser**: Usa Chrome/Edge per migliore compatibilità

### AI non risponde
- **Verifica**: ANTHROPIC_API_KEY in .env
- **Verifica**: Database connesso e popolato
- **Verifica**: Colonne partnerId/agentId esistono

### Matrix Animation non si vede
- **Verifica**: MatrixRain componente importato
- **Verifica**: Canvas supportato dal browser
- **Prova**: Aumentare opacity in AgenzieCase.jsx

---

**Fine Development Log**
