import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurazione storage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/properties');

    // Crea directory se non esiste
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Genera nome file unico: timestamp_random_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

// Filtro per tipi di file immagini
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo file non supportato. Solo JPG, PNG e WebP sono permessi.'), false);
  }
};

// Filtro per video
const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo video non supportato. Solo MP4, WebM, MOV, AVI sono permessi.'), false);
  }
};

// Configurazione multer per immagini
const uploadImages = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 20 // Max 20 file per richiesta
  }
});

// Configurazione multer per planimetrie (stessi limiti delle immagini)
const uploadFloorPlans = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/floorplans');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Max 10 planimetrie
  }
});

// Configurazione multer per video
const uploadVideos = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/videos');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per video
    files: 5 // Max 5 video
  }
});

/**
 * Funzione per aggiungere watermark alle immagini
 */
async function addWatermark(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Dimensioni watermark proporzionali all'immagine
    const watermarkWidth = Math.floor(metadata.width * 0.25); // 25% larghezza immagine
    const fontSize = Math.floor(watermarkWidth / 10); // Proporzionale

    // Crea SVG watermark
    const watermarkSvg = Buffer.from(`
      <svg width="${watermarkWidth}" height="${fontSize + 10}">
        <style>
          .watermark {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: ${fontSize}px;
            font-weight: 700;
            fill: rgba(212, 175, 55, 0.8);
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
          }
        </style>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="watermark">
          AgenzieCase
        </text>
      </svg>
    `);

    // Posizione watermark: basso a destra con padding
    const padding = 20;
    const watermarkPosition = {
      left: metadata.width - watermarkWidth - padding,
      top: metadata.height - (fontSize + 10) - padding
    };

    // Applica watermark
    await image
      .composite([{
        input: watermarkSvg,
        top: watermarkPosition.top,
        left: watermarkPosition.left
      }])
      .toFile(imagePath + '.tmp');

    // Sostituisci file originale con quello watermarkato
    fs.unlinkSync(imagePath);
    fs.renameSync(imagePath + '.tmp', imagePath);

    return true;
  } catch (error) {
    console.error('❌ Watermark error:', error);
    // Se fallisce, mantieni immagine originale
    try {
      if (fs.existsSync(imagePath + '.tmp')) {
        fs.unlinkSync(imagePath + '.tmp');
      }
    } catch (e) {
      // Ignora errori cleanup
    }
    return false;
  }
}

/**
 * POST /api/upload/images
 * Upload multiplo immagini per annunci immobiliari
 * Richiede autenticazione (solo Partner/Agent)
 */
router.post('/images', authenticateToken, uploadImages.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessun file caricato'
      });
    }

    // Verifica che l'utente sia Partner o Agent
    if (req.user.role !== 'partner' && req.user.role !== 'agent') {
      // Elimina file caricati
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });

      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    // Aggiungi watermark a tutte le immagini
    console.log(`🎨 Adding watermark to ${req.files.length} images...`);
    const watermarkPromises = req.files.map(file => addWatermark(file.path));
    await Promise.all(watermarkPromises);

    // Genera URL per ogni file
    const imageUrls = req.files.map(file => {
      return `/uploads/properties/${file.filename}`;
    });

    console.log(`✅ Uploaded ${req.files.length} images with watermark for user ${req.user.id}`);

    res.json({
      success: true,
      message: `${req.files.length} immagini caricate con successo`,
      images: imageUrls,
      count: req.files.length
    });

  } catch (error) {
    console.error('❌ Upload error:', error);

    // Cleanup: elimina file caricati in caso di errore
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Errore durante l\'upload delle immagini',
      error: error.message
    });
  }
});

/**
 * POST /api/upload/floorplans
 * Upload planimetrie (max 10, 10MB ciascuna)
 * Richiede autenticazione (solo Partner/Agent)
 */
router.post('/floorplans', authenticateToken, uploadFloorPlans.array('floorplans', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessun file caricato'
      });
    }

    // Verifica che l'utente sia Partner o Agent
    if (req.user.role !== 'partner' && req.user.role !== 'agent') {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });

      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    // Genera URL per ogni file
    const floorPlanUrls = req.files.map(file => {
      return `/uploads/floorplans/${file.filename}`;
    });

    console.log(`✅ Uploaded ${req.files.length} floor plans for user ${req.user.id}`);

    res.json({
      success: true,
      message: `${req.files.length} planimetrie caricate con successo`,
      floorplans: floorPlanUrls,
      count: req.files.length
    });

  } catch (error) {
    console.error('❌ Floor plans upload error:', error);

    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Errore durante l\'upload delle planimetrie',
      error: error.message
    });
  }
});

/**
 * POST /api/upload/videos
 * Upload video (max 5, 100MB ciascuno)
 * Richiede autenticazione (solo Partner/Agent)
 */
router.post('/videos', authenticateToken, uploadVideos.array('videos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessun file caricato'
      });
    }

    // Verifica che l'utente sia Partner o Agent
    if (req.user.role !== 'partner' && req.user.role !== 'agent') {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });

      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    // Genera URL per ogni file
    const videoUrls = req.files.map(file => {
      return `/uploads/videos/${file.filename}`;
    });

    console.log(`✅ Uploaded ${req.files.length} videos for user ${req.user.id}`);

    res.json({
      success: true,
      message: `${req.files.length} video caricati con successo`,
      videos: videoUrls,
      count: req.files.length
    });

  } catch (error) {
    console.error('❌ Video upload error:', error);

    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Errore durante l\'upload dei video',
      error: error.message
    });
  }
});

/**
 * DELETE /api/upload/:type/:filename
 * Elimina un file specifico (image/floorplan/video)
 * Richiede autenticazione
 */
router.delete('/:type/:filename', authenticateToken, (req, res) => {
  try {
    const { type, filename } = req.params;

    // Determina la directory in base al tipo
    let directory;
    if (type === 'images') {
      directory = 'properties';
    } else if (type === 'floorplans') {
      directory = 'floorplans';
    } else if (type === 'videos') {
      directory = 'videos';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo file non valido'
      });
    }

    const filePath = path.join(__dirname, `../uploads/${directory}`, filename);

    // Verifica che il file esista
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File non trovato'
      });
    }

    // Elimina il file
    fs.unlinkSync(filePath);

    console.log(`🗑️  Deleted ${type}: ${filename}`);

    res.json({
      success: true,
      message: 'File eliminato con successo'
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'eliminazione del file',
      error: error.message
    });
  }
});

/**
 * DELETE /api/upload/:filename (retrocompatibilità)
 * Elimina un'immagine specifica
 * Richiede autenticazione
 */
router.delete('/:filename', authenticateToken, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/properties', filename);

    // Verifica che il file esista
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File non trovato'
      });
    }

    // Elimina il file
    fs.unlinkSync(filePath);

    console.log(`🗑️  Deleted image: ${filename}`);

    res.json({
      success: true,
      message: 'Immagine eliminata con successo'
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'eliminazione dell\'immagine',
      error: error.message
    });
  }
});

// Error handler per multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File troppo grande. Dimensione massima: 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Troppi file. Massimo 20 immagini'
      });
    }
  }

  res.status(500).json({
    success: false,
    message: error.message
  });
});

export default router;
