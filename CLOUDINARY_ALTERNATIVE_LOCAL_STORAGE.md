# ✅ Upload Immagini - Soluzione Storage Locale Implementata

## 📦 Architettura Implementata

Invece di Cloudinary (costoso dopo free tier), ho implementato un sistema di **storage locale** completamente gratuito e scalabile.

## 🎯 Componenti Implementati

### 1. Backend - Upload Route
**File**: `server/routes/upload.js`

**Endpoint POST /api/upload**
- Upload multiplo (max 20 immagini)
- Autenticazione richiesta (JWT token)
- Solo Partner e Agent possono caricare
- Validazione tipo file (JPG, PNG, WebP)
- Limite dimensione: 10MB per file
- Max 20 file per richiesta

**Endpoint DELETE /api/upload/:filename**
- Elimina immagine specifica
- Autenticazione richiesta

**Configurazione Multer:**
```javascript
storage: multer.diskStorage({
  destination: 'server/uploads/properties',
  filename: 'sanitizedName_timestamp_random.ext'
})

limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 20
}

fileFilter: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
```

### 2. Directory Structure
```
server/
  uploads/
    properties/
      [tutte le immagini caricate qui]
```

### 3. Serving Static Files
**File**: `server/index.js` (riga 37)
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

**URL Accessibili**:
- `http://localhost:3001/uploads/properties/image_123456789.jpg`

### 4. Frontend - Upload Function
**File**: `src/components/PropertyCreateModal.jsx` (righe 110-143)

```javascript
const uploadImages = async () => {
  // Crea FormData con tutte le immagini
  const formData = new FormData();
  images.forEach(image => {
    formData.append('images', image);
  });

  // Upload a server
  const response = await fetch('http://localhost:3001/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });

  const data = await response.json();

  // Ritorna array di URL completi
  return data.images.map(url => `http://localhost:3001${url}`);
};
```

## 🔒 Sicurezza

### Validazioni Implementate:
1. **Autenticazione JWT** - Solo utenti loggati
2. **Autorizzazione Ruolo** - Solo Partner/Agent
3. **Tipo File** - Solo immagini (JPG, PNG, WebP)
4. **Dimensione File** - Max 10MB per immagine
5. **Numero File** - Max 20 per richiesta
6. **Nome File Sanitizzato** - Prevenzione path traversal
7. **Cleanup su Errore** - File eliminati se upload fallisce

## 📊 Limiti Configurati

| Parametro | Valore |
|-----------|--------|
| Max immagini per annuncio | 20 |
| Max dimensione singola | 10MB |
| Max dimensione totale frontend | 100MB |
| Formati supportati | JPG, PNG, WebP |
| Storage | Disco locale (illimitato) |

## 💾 Vantaggi vs Cloudinary

| Feature | Storage Locale | Cloudinary Free |
|---------|---------------|-----------------|
| Costo | **€0 sempre** | €0 poi €89+/mese |
| Storage | Illimitato* | 25GB |
| Bandwidth | Illimitato* | 25GB/mese |
| Controllo | Totale | Limitato |
| Privacy | 100% | Su cloud terzi |
| Setup | 5 minuti | 10 minuti |
| Dipendenze | Zero | Servizio esterno |

*Limitato solo dallo spazio disco del server

## 🚀 Workflow Completo

### Upload Flow:
1. **Frontend**: Utente seleziona immagini (max 20)
2. **Validazione Client**: Controllo tipo, dimensione, totale
3. **FormData**: Crea FormData con tutte le immagini
4. **POST /api/upload**: Invia a backend con JWT token
5. **Backend Validation**:
   - Verifica autenticazione
   - Controlla ruolo (partner/agent)
   - Valida tipo file
   - Verifica limiti
6. **Storage**: Salva in `server/uploads/properties/`
7. **Response**: Ritorna array URL
8. **Database**: URL salvati in campo `images` della Property
9. **Display**: Immagini accessibili via `/uploads/properties/filename.jpg`

### Delete Flow:
1. **DELETE /api/upload/:filename**
2. **Backend**: Verifica file esiste
3. **fs.unlinkSync()**: Elimina file da disco
4. **Success**: Conferma eliminazione

## 📝 Esempio Response

### POST /api/upload
```json
{
  "success": true,
  "message": "3 immagini caricate con successo",
  "images": [
    "/uploads/properties/villa_mare_1702387654321_987654321.jpg",
    "/uploads/properties/villa_mare_1702387654322_987654322.jpg",
    "/uploads/properties/villa_mare_1702387654323_987654323.jpg"
  ],
  "count": 3
}
```

### Error Response
```json
{
  "success": false,
  "message": "File troppo grande. Dimensione massima: 10MB"
}
```

## 🔄 Integrazione con Property Model

**Property.images** (database):
```javascript
images: {
  type: DataTypes.ARRAY(DataTypes.TEXT),
  defaultValue: []
}
```

Contiene array di URL:
```javascript
[
  "http://localhost:3001/uploads/properties/image1.jpg",
  "http://localhost:3001/uploads/properties/image2.jpg",
  "http://localhost:3001/uploads/properties/image3.jpg"
]
```

## 🎨 Frontend Integration

PropertyCreateModal utilizza:
- `images` state: Array di File objects
- `imagePreviews` state: Array di base64 per preview
- `uploadImages()`: Upload a server e ritorna URL
- `handleImageSelect()`: Validazione client-side
- `handleRemoveImage()`: Rimuove da preview

## 🛠️ Comandi Utili

### Controllare spazio uploads:
```bash
du -sh server/uploads/properties
```

### Contare immagini:
```bash
ls -1 server/uploads/properties | wc -l
```

### Pulire uploads (test):
```bash
rm -rf server/uploads/properties/*
```

## 📈 Scalabilità

### Per produzione:
1. **CDN**: Aggiungi Nginx reverse proxy
2. **Compression**: Abilita image optimization (sharp)
3. **Backup**: Script automatico per backup uploads
4. **Monitoring**: Log dimensione directory
5. **Cleanup**: Cronjob per eliminare immagini orfane

### Storage Limitato?
Se hai limiti di spazio disco:
1. **Compress on upload**: Usa `sharp` per ridurre dimensione
2. **Lazy load**: Carica solo quando necessario
3. **External NAS**: Monta network storage
4. **S3 Compatible**: Minio (self-hosted S3)

## ✅ Status Implementazione

- ✅ Backend upload endpoint
- ✅ Multer configuration
- ✅ Static file serving
- ✅ Frontend upload function
- ✅ Validazione completa
- ✅ Error handling
- ✅ Security (auth + authorization)
- ✅ Cleanup on error
- ⏳ Testing end-to-end

## 🎯 Prossimi Step

1. **Test Upload** - Testare caricamento da dashboard
2. **Test Display** - Verificare visualizzazione in PropertyList
3. **PropertyEditModal** - Implementare gestione immagini in modifica
4. **Image Optimization** - (Opzionale) Aggiungere compressione con sharp

---

**Data implementazione**: 12 Dicembre 2025
**Costo totale**: €0
**Storage**: Illimitato (spazio disco)
**Dipendenze esterne**: Nessuna
