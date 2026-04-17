# 📸🎥📐 Sistema Upload Multimedia Completo

## 🎯 Panoramica

Sistema di upload completo per annunci immobiliari con supporto per:
- **Immagini** con watermark automatico (max 20, 10MB ciascuna)
- **Planimetrie** (max 10, 10MB ciascuna)
- **Video** (max 5, 100MB ciascuno)
- **Virtual Tour** (URL Matterport/Kuula/360°)

## 🏗️ Architettura

### Backend - Upload Routes

**File**: `server/routes/upload.js`

#### Endpoint Implementati

##### 1. POST /api/upload/images
```javascript
// Upload multiplo immagini con watermark automatico
// Max: 20 file, 10MB ciascuna
// Formati: JPG, PNG, WebP
// Watermark: "AgenzieCase" in basso a destra (oro, semi-trasparente)

Response:
{
  "success": true,
  "message": "3 immagini caricate con successo",
  "images": [
    "/uploads/properties/villa_123.jpg",
    "/uploads/properties/villa_124.jpg"
  ],
  "count": 3
}
```

##### 2. POST /api/upload/floorplans
```javascript
// Upload planimetrie (NO watermark)
// Max: 10 file, 10MB ciascuna
// Formati: JPG, PNG, WebP
// Directory: server/uploads/floorplans/

Response:
{
  "success": true,
  "message": "2 planimetrie caricate con successo",
  "floorplans": [
    "/uploads/floorplans/piano1_123.jpg",
    "/uploads/floorplans/piano2_124.jpg"
  ],
  "count": 2
}
```

##### 3. POST /api/upload/videos
```javascript
// Upload video
// Max: 5 file, 100MB ciascuno
// Formati: MP4, WebM, MOV, AVI
// Directory: server/uploads/videos/

Response:
{
  "success": true,
  "message": "1 video caricati con successo",
  "videos": [
    "/uploads/videos/tour_123.mp4"
  ],
  "count": 1
}
```

##### 4. DELETE /api/upload/:type/:filename
```javascript
// Elimina file specifico
// type: 'images' | 'floorplans' | 'videos'
// Esempio: DELETE /api/upload/images/villa_123.jpg

Response:
{
  "success": true,
  "message": "File eliminato con successo"
}
```

### Frontend - PropertyCreateModal

**File**: `src/components/PropertyCreateModal.jsx`

#### Stati Aggiunti

```javascript
// Immagini con marcature
const [images, setImages] = useState([]);
const [imagePreviews, setImagePreviews] = useState([]);
const [imageMarks, setImageMarks] = useState([]);

// Planimetrie
const [floorPlans, setFloorPlans] = useState([]);
const [floorPlanPreviews, setFloorPlanPreviews] = useState([]);

// Video
const [videos, setVideos] = useState([]);
const [videoPreviews, setVideoPreviews] = useState([]);

// Virtual Tour
const [virtualTourUrl, setVirtualTourUrl] = useState('');
```

#### Funzioni Upload

```javascript
// Upload immagini con watermark
const uploadImages = async () => {
  const formData = new FormData();
  images.forEach(image => formData.append('images', image));

  const response = await fetch('http://localhost:3001/api/upload/images', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  return data.images.map(url => `http://localhost:3001${url}`);
};

// Upload planimetrie
const uploadFloorPlans = async () => {
  if (floorPlans.length === 0) return [];
  // Simile a uploadImages ma endpoint /floorplans
};

// Upload video
const uploadVideos = async () => {
  if (videos.length === 0) return [];
  // Simile a uploadImages ma endpoint /videos
};
```

#### Validazioni Client-Side

**Immagini**:
- Max 20 file per annuncio
- Max 10MB per file
- Max 100MB totali
- Solo JPG, PNG, WebP

**Planimetrie**:
- Max 10 file
- Max 10MB per file
- Solo JPG, PNG, WebP

**Video**:
- Max 5 file
- Max 100MB per file
- Solo MP4, WebM, MOV, AVI

**Virtual Tour**:
- Validazione URL
- Esempi supportati:
  - Matterport: `https://my.matterport.com/show/?m=xxxxx`
  - Kuula: `https://kuula.co/share/xxxxx`
  - Qualsiasi URL 360° viewer

## 🎨 UI/UX

### Sezione Immagini

```
📸 Immagini (max 20)

Marcature disponibili:
⭐ Principale: Prima immagine mostrata (solo una)
📸 Copertina: Usata per copertina galleria
✨ Evidenza: Mostrata in homepage/ricerche

[📷 Clicca per caricare immagini]
JPG, PNG o WebP - Max 10MB per immagine, 100MB totali

[Grid di anteprime con badges e bottoni marcatura]
```

### Sezione Planimetrie

```
📐 Planimetrie (max 10)

Carica le planimetrie dell'immobile (facoltativo)

[📐 Clicca per caricare planimetrie]
JPG, PNG o WebP - Max 10MB per file

[Grid di anteprime semplici]
```

### Sezione Video

```
🎥 Video (max 5)

Carica video dell'immobile (facoltativo) - Max 100MB per video

[🎥 Clicca per caricare video]
MP4, WebM, MOV, AVI - Max 100MB per video

[Lista card video con nome e dimensione]
```

### Sezione Virtual Tour

```
🌐 Virtual Tour

Inserisci l'URL del virtual tour (Matterport, Kuula, 360° viewer, etc.)
Esempi: https://my.matterport.com/show/?m=xxxxx

[Input URL]

✓ Virtual tour URL valido (se compilato)
```

## 🔧 Configurazione Multer

### Immagini con Watermark

```javascript
const uploadImages = multer({
  storage: multer.diskStorage({
    destination: 'server/uploads/properties',
    filename: 'sanitizedName_timestamp_random.ext'
  }),
  fileFilter: imageFilter, // JPG, PNG, WebP
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20
  }
});

// Watermark applicato automaticamente dopo upload
async function addWatermark(imagePath) {
  const watermarkSvg = Buffer.from(`
    <svg width="${watermarkWidth}" height="${fontSize + 10}">
      <text fill="rgba(212, 175, 55, 0.8)">AgenzieCase</text>
    </svg>
  `);

  await sharp(imagePath)
    .composite([{ input: watermarkSvg, top, left }])
    .toFile(imagePath + '.tmp');

  fs.renameSync(imagePath + '.tmp', imagePath);
}
```

### Planimetrie

```javascript
const uploadFloorPlans = multer({
  storage: multer.diskStorage({
    destination: 'server/uploads/floorplans',
    filename: 'sanitizedName_timestamp_random.ext'
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  }
});
```

### Video

```javascript
const uploadVideos = multer({
  storage: multer.diskStorage({
    destination: 'server/uploads/videos',
    filename: 'sanitizedName_timestamp_random.ext'
  }),
  fileFilter: videoFilter, // MP4, WebM, MOV, AVI
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 5
  }
});
```

## 📊 Struttura Directory

```
server/
  uploads/
    properties/        # Immagini con watermark
      villa_123.jpg
      villa_124.jpg
    floorplans/        # Planimetrie (no watermark)
      piano1_123.jpg
      piano2_124.jpg
    videos/            # Video
      tour_123.mp4
      tour_124.webm
```

## 🎯 Payload API Creazione Annuncio

```javascript
POST /api/properties

{
  // ... altri dati annuncio

  "images": [
    "http://localhost:3001/uploads/properties/villa_123.jpg",
    "http://localhost:3001/uploads/properties/villa_124.jpg"
  ],
  "mainImage": "http://localhost:3001/uploads/properties/villa_123.jpg",

  "floorPlans": [
    "http://localhost:3001/uploads/floorplans/piano1_123.jpg",
    "http://localhost:3001/uploads/floorplans/piano2_124.jpg"
  ],

  "videos": [
    "http://localhost:3001/uploads/videos/tour_123.mp4"
  ],

  "virtualTourUrl": "https://my.matterport.com/show/?m=xxxxx"
}
```

## 🔐 Sicurezza

### Validazioni Backend

```javascript
// Autenticazione richiesta
router.post('/images', authenticateToken, uploadImages.array('images', 20), ...);

// Solo Partner/Agent possono caricare
if (req.user.role !== 'partner' && req.user.role !== 'agent') {
  // Cleanup files e return 403
}

// Validazione tipo file
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo file non supportato'), false);
  }
};

// Nome file sanitizzato
const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
```

## 🎨 Virtual Tour - Servizi Consigliati

### 1. Matterport
- **URL**: https://matterport.com/
- **Costo**: Da $9.99/mese
- **Pro**: Qualità professionale, molto diffuso
- **Formato URL**: `https://my.matterport.com/show/?m=xxxxx`

### 2. Kuula
- **URL**: https://kuula.co/
- **Costo**: Piano Free disponibile
- **Pro**: Facile da usare, buon rapporto qualità/prezzo
- **Formato URL**: `https://kuula.co/share/xxxxx`

### 3. EyeSpy360
- **URL**: https://eyespy360.com/
- **Costo**: Da £99/anno
- **Pro**: Specifico per real estate UK/EU
- **Formato URL**: `https://eyespy360.com/tour/xxxxx`

### 4. Ricoh Theta
- **URL**: https://theta360.com/
- **Costo**: Hardware camera + app gratuita
- **Pro**: Camera 360° dedicata, qualità ottima
- **Formato URL**: `https://theta360.com/s/xxxxx`

## 📱 Esempio Virtual Tour Embed

Per mostrare il virtual tour nella pagina dettaglio immobile:

```javascript
// Matterport
<iframe
  width="100%"
  height="600px"
  src={virtualTourUrl}
  frameBorder="0"
  allowFullScreen
/>

// Kuula
<iframe
  width="100%"
  height="600px"
  src={virtualTourUrl}
  frameBorder="0"
  allowFullScreen
  allow="vr"
/>
```

## 🚀 Workflow Completo Upload

1. **Utente seleziona file** → Validazione client-side
2. **Submit form** → Tutti i file vengono caricati in parallelo
3. **Server riceve** → Validazione server-side
4. **Immagini** → Watermark automatico applicato
5. **File salvati** → Directory specifiche per tipo
6. **URL ritornati** → Array di path relativi
7. **Property creata** → URL salvati nel database
8. **Display** → File accessibili via `/uploads/...`

## ⚡ Performance

### Upload Parallelo

```javascript
// Tutti gli upload avvengono in parallelo
setUploading(true);
const [imageUrls, floorPlanUrls, videoUrls] = await Promise.all([
  uploadImages(),
  uploadFloorPlans(),
  uploadVideos()
]);
setUploading(false);
```

### Ottimizzazioni Future

- **Compression**: Usa Sharp per ridurre dimensione file
- **Progressive Upload**: Upload chunk per video grandi
- **Lazy Loading**: Carica immagini on-demand
- **CDN**: Servi file statici tramite CDN
- **Image Optimization**: WebP conversion automatica

## 📊 Limiti Implementati

| Tipo | Max Files | Max Size/File | Max Total | Formati |
|------|-----------|---------------|-----------|---------|
| Immagini | 20 | 10MB | 100MB | JPG, PNG, WebP |
| Planimetrie | 10 | 10MB | - | JPG, PNG, WebP |
| Video | 5 | 100MB | - | MP4, WebM, MOV, AVI |
| Virtual Tour | 1 | - | - | URL |

## ✅ Testing

### Test Immagini
```bash
# Upload 3 immagini
curl -X POST http://localhost:3001/api/upload/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg"
```

### Test Planimetrie
```bash
# Upload 2 planimetrie
curl -X POST http://localhost:3001/api/upload/floorplans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "floorplans=@floor1.jpg" \
  -F "floorplans=@floor2.jpg"
```

### Test Video
```bash
# Upload 1 video
curl -X POST http://localhost:3001/api/upload/videos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "videos=@tour.mp4"
```

## 🎯 Prossimi Step

- [ ] PropertyEditModal con gestione upload
- [ ] Drag & drop per riordinare immagini
- [ ] Crop/rotate immagini prima dell'upload
- [ ] Generazione automatica thumbnail
- [ ] Compressione video lato server
- [ ] Preview virtual tour in modal
- [ ] Integrazione con servizi cloud (S3, Cloudinary)

---

**Data implementazione**: 12 Dicembre 2025
**Costo**: €0 (storage locale)
**Dipendenze**: Sharp, Multer
**Stato**: ✅ Completamente funzionante
