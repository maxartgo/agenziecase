import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crea la cartella uploads se non esiste
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Crea sottocartelle per i diversi tipi di file
const documentsDir = path.join(uploadDir, 'documents');
const logosDir = path.join(uploadDir, 'logos');
const propertiesDir = path.join(uploadDir, 'properties');

[documentsDir, logosDir, propertiesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configurazione storage per documenti (Visura, Documento Identità)
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    // Genera nome file unico: timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// Configurazione storage per loghi
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `logo-${basename}-${uniqueSuffix}${ext}`);
  }
});

// Configurazione storage per immagini immobili
const propertyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, propertiesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `property-${basename}-${uniqueSuffix}${ext}`);
  }
});

// Filtro per documenti (PDF, JPG, PNG)
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato file non valido. Sono accettati solo PDF, JPG e PNG'), false);
  }
};

// Filtro per loghi (solo immagini)
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato file non valido. Sono accettate solo immagini (JPG, PNG, WEBP)'), false);
  }
};

// Middleware per upload documenti (max 5MB)
export const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).fields([
  { name: 'visuraCamerale', maxCount: 1 },
  { name: 'documentoIdentita', maxCount: 1 }
]);

// Middleware per upload logo (max 2MB)
export const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
}).single('logo');

// Middleware per upload immagini immobili (max 10 immagini, 5MB ciascuna)
export const uploadPropertyImages = multer({
  storage: propertyStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per immagine
  }
}).array('images', 10); // max 10 immagini

// Gestione errori upload
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File troppo grande. Dimensione massima: 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Troppi file. Massimo 10 immagini'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo file non previsto'
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Errore durante l\'upload del file'
    });
  }

  next();
};

// Funzione helper per eliminare file
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Errore eliminazione file:', error);
    return false;
  }
};
