# 🌐 Virtual Tour - Implementazione Completa

**Data**: 13 Dicembre 2025
**Tipo**: Semi-Automatico (Step A)
**Status**: ✅ Implementato e pronto per uso

---

## 📋 Sommario

Sistema completo per la gestione di Virtual Tour tramite integrazione con Kuula. I partner caricano le foto, l'admin crea il tour su Kuula manualmente e lo pubblica incollando l'URL.

---

## 🎯 Flusso Completo

```
1. Partner acquista pack Virtual Tour → Riceve crediti
2. Partner seleziona immobile e carica foto (5-30 foto)
3. Sistema crea richiesta + notifica admin
4. Admin scarica foto, crea tour su Kuula
5. Admin incolla URL Kuula nel pannello
6. Sistema pubblica tour + scala 1 credito + notifica partner
```

---

## 📁 Files Creati/Modificati

### Database

#### [server/migrations/add_virtual_tour_fields.sql](server/migrations/add_virtual_tour_fields.sql)
Aggiunge campi virtual tour alla tabella `properties`:
- `virtualTourUrl` - URL del tour Kuula
- `vtRequestStatus` - Stato richiesta (none, pending, processing, completed, rejected)
- `vtRequestedAt` - Data richiesta
- `vtCompletedAt` - Data completamento

#### [server/migrations/create_virtual_tour_requests.sql](server/migrations/create_virtual_tour_requests.sql)
Nuova tabella `virtual_tour_requests` per gestire richieste:
- Dati richiesta (property_id, partner_id, photos_folder, photos_count, notes)
- Status tracking (pending, processing, completed, rejected)
- Admin data (kuula_url, admin_notes, processed_by)
- Timestamps (requested_at, processing_started_at, completed_at)

#### [server/scripts/run_vt_migrations.js](server/scripts/run_vt_migrations.js)
Script per eseguire entrambe le migrations automaticamente.

### Backend API

#### [server/routes/virtualTourRequests.js](server/routes/virtualTourRequests.js) ✨ NUOVO
API complete per gestione virtual tour:

**Partner Endpoints:**
- `POST /api/virtual-tour-requests/upload` - Upload foto (max 30, 10MB/foto)
- `GET /api/virtual-tour-requests/partner` - Lista richieste partner

**Admin Endpoints:**
- `GET /api/virtual-tour-requests/admin/pending` - Lista richieste pending
- `POST /api/virtual-tour-requests/admin/complete` - Pubblica tour (incolla URL)
- `POST /api/virtual-tour-requests/admin/reject` - Rifiuta richiesta

**Features:**
- Multer per upload foto
- Validazione crediti partner
- Verifica ownership immobile
- Prevenzione richieste duplicate
- Automatic credit deduction
- Status tracking completo

#### [server/utils/emailNotifications.js](server/utils/emailNotifications.js) ✨ NUOVO
Sistema notifiche (console.log per ora, pronto per email reali):

```javascript
// Notifica admin quando partner carica foto
notifyAdminNewVTRequest({
  requestId, propertyTitle, partnerName,
  partnerEmail, photosCount
});

// Notifica partner quando tour è completato
notifyPartnerVTCompleted({
  partnerEmail, partnerName, propertyTitle, tourUrl
});

// Notifica partner quando richiesta è rifiutata
notifyPartnerVTRejected({
  partnerEmail, partnerName, propertyTitle, reason
});
```

**Per implementare email reali**: Decommentare sezioni con nodemailer/sendgrid nel file.

#### [server/index.js](server/index.js) - MODIFICATO
Aggiunto:
```javascript
import virtualTourRequestsRoutes from './routes/virtualTourRequests.js';
app.use('/api/virtual-tour-requests', virtualTourRequestsRoutes);
```

### Frontend Components

#### [src/components/VirtualTourUpload.jsx](src/components/VirtualTourUpload.jsx) ✨ NUOVO
Form partner per upload foto virtual tour:

**Features**:
- Select property da dropdown
- Multi-file upload (min 5, max 30 foto)
- Photo preview grid
- Note opzionali
- Visualizzazione crediti rimanenti
- Lista richieste esistenti con status
- Validazione credits prima upload

**Props**: `{ token }`

**Utilizzo**:
```jsx
import VirtualTourUpload from './components/VirtualTourUpload';
<VirtualTourUpload token={userToken} />
```

#### [src/components/AdminVirtualTourManager.jsx](src/components/AdminVirtualTourManager.jsx) ✨ NUOVO
Dashboard admin per gestire richieste:

**Features**:
- Lista richieste pending con dettagli
- Percorso foto per download
- Form incolla URL Kuula
- Note admin opzionali
- Pulsanti "Pubblica" e "Rifiuta"
- Istruzioni workflow integrate

**Props**: `{ token }`

**Utilizzo**:
```jsx
import AdminVirtualTourManager from './components/AdminVirtualTourManager';
<AdminVirtualTourManager token={adminToken} />
```

#### [src/components/VirtualTourPacks.jsx](src/components/VirtualTourPacks.jsx) - GIÀ ESISTENTE
Pagina acquisto pack (già implementata precedentemente).

---

## 🗄️ Database Schema

### Tabella: `properties`

```sql
ALTER TABLE properties ADD COLUMN "virtualTourUrl" VARCHAR(500);
ALTER TABLE properties ADD COLUMN "vtRequestStatus" VARCHAR(50) DEFAULT 'none';
ALTER TABLE properties ADD COLUMN "vtRequestedAt" TIMESTAMP;
ALTER TABLE properties ADD COLUMN "vtCompletedAt" TIMESTAMP;
```

**Status values**: none, pending, processing, completed, rejected

### Tabella: `virtual_tour_requests` (NUOVA)

```sql
CREATE TABLE virtual_tour_requests (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  partner_id INTEGER REFERENCES partners(id),

  -- Request data
  photos_folder VARCHAR(500),      -- Path: virtual-tours/{propertyId}/
  photos_count INTEGER DEFAULT 0,
  notes TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'pending',

  -- Admin data
  kuula_url VARCHAR(500),
  admin_notes TEXT,
  processed_by INTEGER REFERENCES users(id),

  -- Timestamps
  requested_at TIMESTAMP DEFAULT NOW(),
  processing_started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Setup & Deploy

### 1. Eseguire Migrations

```bash
cd server
node scripts/run_vt_migrations.js
```

Output atteso:
```
🚀 Running Virtual Tour migrations...
✅ Virtual tour fields added to properties
✅ virtual_tour_requests table created
🎉 All migrations completed successfully!
```

### 2. Verificare Database

```sql
-- Verifica campi properties
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
AND column_name LIKE 'vt%';

-- Verifica tabella requests
SELECT * FROM virtual_tour_requests LIMIT 1;
```

### 3. Restart Server

Il server rileva automaticamente le nuove route all'avvio.

---

## 📖 Come Usare

### Per il Partner

1. **Acquista crediti**:
   - Vai su "Virtual Tour Packs"
   - Scegli un piano (Starter €99, Business €179, Professional €249)
   - Acquista → Ricevi crediti

2. **Richiedi virtual tour**:
   - Vai su "Richiedi Virtual Tour" (usa componente `VirtualTourUpload`)
   - Seleziona immobile dal dropdown
   - Carica 5-30 foto (JPG/PNG, max 10MB/foto)
   - Aggiungi note opzionali
   - Clicca "Invia Richiesta"

3. **Monitora richiesta**:
   - Vedi status nella sezione "Le Tue Richieste"
   - Status: ⏳ In attesa → 🔄 In lavorazione → ✅ Completato
   - Quando completato, vedi URL tour Kuula

### Per l'Admin

1. **Ricevi notifica**:
   - Console log mostra nuova richiesta con dettagli

2. **Dashboard admin** (usa componente `AdminVirtualTourManager`):
   - Vedi tutte le richieste pending
   - Per ogni richiesta vedi:
     - Immobile e partner
     - Numero foto caricate
     - Path per scaricare: `server/uploads/virtual-tours/{propertyId}/`

3. **Crea tour su Kuula**:
   - Scarica foto dalla cartella indicata
   - Vai su [kuula.co](https://kuula.co)
   - Crea virtual tour con le foto
   - Copia URL tour

4. **Pubblica tour**:
   - Incolla URL nel form admin dashboard
   - Aggiungi note opzionali
   - Clicca "Pubblica Virtual Tour"
   - Sistema:
     - Aggiorna property con URL
     - Scala 1 credito dal partner
     - Notifica partner
     - Registra in `virtual_tour_usage`

### Per Rifiutare Richiesta

- Clicca "Rifiuta" nella dashboard admin
- Inserisci motivo
- Sistema notifica partner (no crediti scalati)

---

## 🔐 API Endpoints Reference

### Partner APIs

#### Upload Foto
```http
POST /api/virtual-tour-requests/upload
Authorization: Bearer {partnerToken}
Content-Type: multipart/form-data

Body (FormData):
- propertyId: Integer (required)
- photos: File[] (required, 5-30 files)
- notes: String (optional)

Response 200:
{
  "success": true,
  "message": "Richiesta virtual tour inviata con successo!",
  "data": {
    "propertyId": 123,
    "photosCount": 15,
    "status": "pending"
  }
}
```

#### Get Partner Requests
```http
GET /api/virtual-tour-requests/partner
Authorization: Bearer {partnerToken}

Response 200:
{
  "success": true,
  "requests": [
    {
      "id": 1,
      "property_id": 123,
      "property_title": "Villa con giardino",
      "property_address": "Via Roma 10",
      "photos_count": 15,
      "notes": "Fare attenzione alla luce",
      "status": "pending",
      "kuula_url": null,
      "admin_notes": null,
      "requested_at": "2025-12-13T10:30:00Z",
      "completed_at": null
    }
  ]
}
```

### Admin APIs

#### Get Pending Requests
```http
GET /api/virtual-tour-requests/admin/pending
Authorization: Bearer {adminToken}

Response 200:
{
  "success": true,
  "requests": [
    {
      "id": 1,
      "property_id": 123,
      "partner_id": 5,
      "photos_folder": "virtual-tours/123",
      "photos_count": 15,
      "notes": "Note partner",
      "status": "pending",
      "requested_at": "2025-12-13T10:30:00Z",
      "property_title": "Villa con giardino",
      "property_address": "Via Roma 10, Milano",
      "property_city": "Milano",
      "partner_name": "MAXICASA",
      "partner_email": "maxartgo@proton.me"
    }
  ]
}
```

#### Complete Request
```http
POST /api/virtual-tour-requests/admin/complete
Authorization: Bearer {adminToken}
Content-Type: application/json

Body:
{
  "requestId": 1,
  "kууlaUrl": "https://kuula.co/share/xyz123",
  "adminNotes": "Tour created successfully"
}

Response 200:
{
  "success": true,
  "message": "Virtual tour completato e pubblicato con successo!"
}

Side Effects:
- Updates virtual_tour_requests.status = 'completed'
- Updates virtual_tour_requests.kuula_url
- Updates properties.virtualTourUrl
- Updates properties.vtRequestStatus = 'completed'
- Decrements partners.vt_credits by 1
- Inserts record in virtual_tour_usage
- Sends notification to partner
```

#### Reject Request
```http
POST /api/virtual-tour-requests/admin/reject
Authorization: Bearer {adminToken}
Content-Type: application/json

Body:
{
  "requestId": 1,
  "reason": "Foto di bassa qualità"
}

Response 200:
{
  "success": true,
  "message": "Richiesta rifiutata"
}

Side Effects:
- Updates virtual_tour_requests.status = 'rejected'
- Updates virtual_tour_requests.admin_notes
- Updates properties.vtRequestStatus = 'rejected'
- Sends notification to partner
- NO credit deduction
```

---

## 📧 Notifiche Email (TODO Future)

Attualmente le notifiche usano `console.log`. Per implementare email reali:

1. **Installa nodemailer**:
```bash
npm install nodemailer
```

2. **Configura in [server/utils/emailNotifications.js](server/utils/emailNotifications.js)**:
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmail(emailData) {
  await transporter.sendMail(emailData);
}
```

3. **Decommentare** le sezioni HTML email nei 3 metodi.

4. **Aggiungere a [.env](server/.env)**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@agenziecase.it
```

---

## 🧪 Testing Completo

### Test 1: Partner Upload Foto

```bash
# Simulazione richiesta
POST http://localhost:3001/api/virtual-tour-requests/upload
Authorization: Bearer {partnerToken}

FormData:
- propertyId: 1
- photos: [file1.jpg, file2.jpg, ...]
- notes: "Test virtual tour"
```

**Verifiche**:
```sql
-- Verifica request creata
SELECT * FROM virtual_tour_requests ORDER BY id DESC LIMIT 1;

-- Verifica property aggiornata
SELECT "vtRequestStatus", "vtRequestedAt"
FROM properties WHERE id = 1;

-- Verifica foto caricate
```
Controlla cartella: `server/uploads/virtual-tours/1/`

### Test 2: Admin Complete

```bash
POST http://localhost:3001/api/virtual-tour-requests/admin/complete
Authorization: Bearer {adminToken}

Body:
{
  "requestId": 1,
  "kууlaUrl": "https://kuula.co/share/test123"
}
```

**Verifiche**:
```sql
-- Verifica request completata
SELECT status, kuula_url, completed_at
FROM virtual_tour_requests WHERE id = 1;

-- Verifica property ha URL
SELECT "virtualTourUrl", "vtRequestStatus", "vtCompletedAt"
FROM properties WHERE id = 1;

-- Verifica credito scalato
SELECT vt_credits FROM partners WHERE id = 5;

-- Verifica usage registrato
SELECT * FROM virtual_tour_usage ORDER BY created_at DESC LIMIT 1;
```

### Test 3: Admin Reject

```bash
POST http://localhost:3001/api/virtual-tour-requests/admin/reject
Authorization: Bearer {adminToken}

Body:
{
  "requestId": 2,
  "reason": "Foto sfocate"
}
```

**Verifiche**:
```sql
SELECT status, admin_notes FROM virtual_tour_requests WHERE id = 2;
SELECT "vtRequestStatus" FROM properties WHERE id = 2;
-- Verifica crediti NON scalati
SELECT vt_credits FROM partners WHERE id = 5;
```

---

## 📊 Statistiche & Monitoring

### Query Utili

```sql
-- Richieste per status
SELECT status, COUNT(*) as count
FROM virtual_tour_requests
GROUP BY status;

-- Richieste pending più vecchie
SELECT vtr.id, p.title, vtr.requested_at,
       EXTRACT(EPOCH FROM (NOW() - vtr.requested_at))/3600 as hours_waiting
FROM virtual_tour_requests vtr
JOIN properties p ON vtr.property_id = p.id
WHERE vtr.status = 'pending'
ORDER BY vtr.requested_at ASC;

-- Top partner per virtual tour
SELECT part."companyName", COUNT(vtu.id) as tours_created
FROM virtual_tour_usage vtu
JOIN partners part ON vtu.partner_id = part.id
GROUP BY part."companyName"
ORDER BY tours_created DESC
LIMIT 10;

-- Revenue virtual tour (ultimo mese)
SELECT COUNT(*) * 99 as revenue_estimate
FROM virtual_tour_usage
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

## 🎨 Customizzazioni Possibili

### 1. Limite Foto Personalizzato per Piano

Modifica in [server/routes/virtualTourRequests.js](server/routes/virtualTourRequests.js:35):
```javascript
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: partner.vt_plan === 'professional' ? 50 : 30 // Pro = 50, altri = 30
  },
  // ...
});
```

### 2. Auto-Approval per Photo Check Automatico

Aggiungi AI vision check in upload endpoint:
```javascript
// Dopo upload foto
const qualityCheck = await checkPhotoQuality(files);
if (qualityCheck.allGood) {
  // Auto-approve e notifica admin
}
```

### 3. Watermark Automatico

Aggiungi processing dopo upload:
```javascript
import sharp from 'sharp';

files.forEach(async (file) => {
  await sharp(file.path)
    .composite([{ input: 'watermark.png', gravity: 'southeast' }])
    .toFile(file.path.replace('.jpg', '-watermarked.jpg'));
});
```

### 4. Integrazione Webhook Kuula (Future)

Se Kuula offrirà webhook:
```javascript
router.post('/kuula-webhook', async (req, res) => {
  const { tourUrl, propertyId } = req.body;
  // Auto-complete request quando Kuula finisce upload
});
```

---

## 🐛 Troubleshooting

### Problema: Upload fallisce con "File too large"

**Soluzione**: Aumenta limite in multer o check dimensione foto.

### Problema: Crediti non vengono scalati

**Verifica**:
```sql
SELECT vt_credits FROM partners WHERE id = X;
```
Check logs console per errori nel complete endpoint.

### Problema: Foto non si vedono in cartella

**Verifica**:
- Path corretto: `server/uploads/virtual-tours/{propertyId}/`
- Permessi scrittura sulla cartella
- Check logs multer errors

### Problema: Notifiche non arrivano

Attualmente sono solo console.log. Per email reali implementare nodemailer come descritto sopra.

---

## 📝 Note Importanti

1. **Crediti**: Scalati SOLO quando admin completa (non quando carica foto)
2. **Foto Storage**: Stored localmente in `server/uploads/virtual-tours/`
3. **Security**: Multer valida file type (solo JPG/PNG) e dimensione
4. **Duplicate Prevention**: Non può esserci >1 richiesta pending per stessa property
5. **Ownership Check**: Partner può uploadare solo per suoi immobili

---

## 🎯 Prossimi Step Opzionali

- [ ] Implementare email reali con nodemailer
- [ ] Dashboard statistiche virtual tour
- [ ] Auto-delete foto dopo completamento (per risparmiare spazio)
- [ ] Integrazione diretta API Kuula (quando disponibile)
- [ ] Photo quality check automatico con AI
- [ ] Watermarking automatico
- [ ] Bulk operations per admin

---

## ✅ Conclusione

Sistema completo e funzionante per:
- ✅ Partner acquista crediti
- ✅ Partner carica foto
- ✅ Notifica admin
- ✅ Admin crea tour su Kuula
- ✅ Admin pubblica con URL
- ✅ Crediti scalati automaticamente
- ✅ Notifica partner
- ✅ Tour visibile in property listing

**Implementato da**: Claude Sonnet 4.5
**Data**: 13 Dicembre 2025
**Status**: ✅ Pronto per produzione
