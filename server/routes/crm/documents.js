import express from 'express';
import { Document, Client, Agent, Deal, Property } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configurazione multer per upload files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Accetta solo determinati tipi di file
    const allowedTypes = /pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo di file non supportato'));
    }
  }
});

// ============================================
// GET /api/crm/documents - Lista documenti
// ============================================
router.get('/', async (req, res) => {
  try {
    const {
      partnerId,
      clientId,
      dealId,
      propertyId,
      uploadedBy,
      category,
      isPublic,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    // Costruisci filtri dinamici
    const where = {};

    if (partnerId) where.partnerId = partnerId;
    if (clientId) where.clientId = clientId;
    if (dealId) where.dealId = dealId;
    if (propertyId) where.propertyId = propertyId;
    if (uploadedBy) where.uploadedBy = uploadedBy;
    if (category) where.category = category;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    // Ricerca per nome file o titolo
    if (search) {
      where[Op.or] = [
        { fileName: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const documents = await Document.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Agent,
          as: 'uploadedByAgent',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Deal,
          as: 'deal',
          attributes: ['id', 'title', 'stage']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      documents: documents.rows,
      total: documents.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Errore recupero documenti:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/documents/:id - Dettaglio documento
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          as: 'client'
        },
        {
          model: Agent,
          as: 'uploadedByAgent',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Deal,
          as: 'deal'
        },
        {
          model: Property,
          as: 'property'
        }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento non trovato'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Errore recupero documento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/crm/documents/upload - Upload documento
// ============================================
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    const {
      title,
      category,
      notes,
      tags,
      isPublic,
      expiresAt,
      clientId,
      dealId,
      propertyId,
      uploadedBy,
      partnerId
    } = req.body;

    // Validazione base
    if (!partnerId || !uploadedBy) {
      // Rimuovi il file caricato se la validazione fallisce
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'partnerId e uploadedBy sono obbligatori'
      });
    }

    // Crea il documento nel database
    const document = await Document.create({
      fileName: req.file.originalname,
      title: title || req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: category || 'other',
      notes,
      tags: tags ? JSON.parse(tags) : [],
      isPublic: isPublic === 'true',
      expiresAt: expiresAt || null,
      clientId: clientId || null,
      dealId: dealId || null,
      propertyId: propertyId || null,
      uploadedBy,
      partnerId
    });

    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Errore upload documento:', error);
    // Rimuovi il file se c'è stato un errore
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// PUT /api/crm/documents/:id - Aggiorna documento
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento non trovato'
      });
    }

    // Parse tags se presenti
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }

    await document.update(req.body);

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Errore aggiornamento documento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DELETE /api/crm/documents/:id - Elimina documento
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento non trovato'
      });
    }

    // Rimuovi il file fisico
    const filePath = path.join(process.cwd(), document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.destroy();

    res.json({
      success: true,
      message: 'Documento eliminato con successo'
    });
  } catch (error) {
    console.error('Errore eliminazione documento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/documents/download/:id - Download documento
// ============================================
router.get('/download/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento non trovato'
      });
    }

    const filePath = path.join(process.cwd(), document.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File non trovato sul server'
      });
    }

    res.download(filePath, document.fileName);
  } catch (error) {
    console.error('Errore download documento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/documents/stats/:partnerId - Statistiche documenti
// ============================================
router.get('/stats/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;

    // Totale documenti
    const total = await Document.count({ where: { partnerId } });

    // Documenti per categoria
    const byCategory = await Document.findAll({
      where: { partnerId },
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    // Dimensione totale (in bytes)
    const totalSize = await Document.sum('fileSize', {
      where: { partnerId }
    });

    // Documenti pubblici vs privati
    const publicCount = await Document.count({
      where: { partnerId, isPublic: true }
    });
    const privateCount = await Document.count({
      where: { partnerId, isPublic: false }
    });

    // Documenti caricati questo mese
    const thisMonthCount = await Document.count({
      where: {
        partnerId,
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Documenti in scadenza (prossimi 30 giorni)
    const expiringCount = await Document.count({
      where: {
        partnerId,
        expiresAt: {
          [Op.gte]: new Date(),
          [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      success: true,
      stats: {
        total,
        publicCount,
        privateCount,
        totalSize: totalSize || 0,
        totalSizeMB: totalSize ? (totalSize / (1024 * 1024)).toFixed(2) : 0,
        thisMonthCount,
        expiringCount,
        byCategory
      }
    });
  } catch (error) {
    console.error('Errore statistiche documenti:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
