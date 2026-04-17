import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  notifyVirtualTourCompleted,
  notifyVirtualTourRejected
} from '../services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurazione multer per upload foto virtual tour
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const propertyId = req.body.propertyId;
    const uploadPath = path.join(__dirname, '../uploads/virtual-tours', propertyId);

    // Crea directory se non esiste
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per foto
    files: 30 // Max 30 foto per virtual tour
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo immagini JPG e PNG sono permesse'));
    }
  }
});

/**
 * POST /api/virtual-tour-requests/upload
 * Upload foto per richiedere virtual tour
 * Richiede autenticazione (solo Partner)
 */
router.post('/upload', authenticateToken, upload.array('photos', 30), async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId, notes } = req.body;
    const files = req.files;

    // Validazione
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID richiesto'
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Carica almeno una foto'
      });
    }

    // Verifica che l'utente sia Partner
    if (req.user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        message: 'Solo i Partner possono richiedere virtual tour'
      });
    }

    // Recupera partner
    const [partner] = await sequelize.query(`
      SELECT id, vt_credits
      FROM partners
      WHERE "userId" = :userId
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    // Verifica crediti disponibili
    if (!partner.vt_credits || partner.vt_credits < 1) {
      return res.status(400).json({
        success: false,
        message: 'Crediti insufficienti. Acquista un pack Virtual Tour per continuare.',
        credits: partner.vt_credits || 0
      });
    }

    // Verifica che la property appartenga al partner
    const [property] = await sequelize.query(`
      SELECT id, title, "partnerId"
      FROM properties
      WHERE id = :propertyId
    `, {
      replacements: { propertyId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Immobile non trovato'
      });
    }

    if (property.partnerId !== partner.id) {
      return res.status(403).json({
        success: false,
        message: 'Non hai permessi per questo immobile'
      });
    }

    // Verifica che non ci sia già una richiesta pending per questa property
    const [existingRequest] = await sequelize.query(`
      SELECT id, status
      FROM virtual_tour_requests
      WHERE property_id = :propertyId
      AND status IN ('pending', 'processing')
    `, {
      replacements: { propertyId },
      type: sequelize.QueryTypes.SELECT
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Esiste già una richiesta virtual tour in lavorazione per questo immobile'
      });
    }

    // Path relativo alle foto
    const photosFolder = `virtual-tours/${propertyId}`;

    // Crea richiesta virtual tour
    await sequelize.query(`
      INSERT INTO virtual_tour_requests (
        property_id,
        partner_id,
        photos_folder,
        photos_count,
        notes,
        status
      ) VALUES (
        :propertyId,
        :partnerId,
        :photosFolder,
        :photosCount,
        :notes,
        'pending'
      )
    `, {
      replacements: {
        propertyId,
        partnerId: partner.id,
        photosFolder,
        photosCount: files.length,
        notes: notes || null
      }
    });

    // Aggiorna property con stato richiesta
    await sequelize.query(`
      UPDATE properties
      SET
        "vtRequestStatus" = 'pending',
        "vtRequestedAt" = NOW()
      WHERE id = :propertyId
    `, {
      replacements: { propertyId }
    });

    // Recupera request ID appena creata
    const [newRequest] = await sequelize.query(`
      SELECT id FROM virtual_tour_requests
      WHERE property_id = :propertyId AND status = 'pending'
      ORDER BY requested_at DESC LIMIT 1
    `, {
      replacements: { propertyId },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`✅ Virtual tour richiesto per property ${propertyId} - ${files.length} foto caricate`);

    res.json({
      success: true,
      message: 'Richiesta virtual tour inviata con successo!',
      data: {
        propertyId,
        photosCount: files.length,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('❌ Error uploading virtual tour photos:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'upload delle foto',
      error: error.message
    });
  }
});

/**
 * GET /api/virtual-tour-requests/partner
 * Ottiene richieste virtual tour del partner
 * Richiede autenticazione (solo Partner)
 */
router.get('/partner', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        message: 'Solo i Partner possono accedere a questa risorsa'
      });
    }

    // Recupera partner
    const [partner] = await sequelize.query(`
      SELECT id FROM partners WHERE "userId" = :userId
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    // Recupera richieste
    const requests = await sequelize.query(`
      SELECT
        vtr.id,
        vtr.property_id,
        vtr.photos_count,
        vtr.notes,
        vtr.status,
        vtr.kuula_url,
        vtr.admin_notes,
        vtr.requested_at,
        vtr.completed_at,
        p.title as property_title,
        p.address as property_address
      FROM virtual_tour_requests vtr
      LEFT JOIN properties p ON vtr.property_id = p.id
      WHERE vtr.partner_id = :partnerId
      ORDER BY vtr.requested_at DESC
    `, {
      replacements: { partnerId: partner.id },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('❌ Error fetching partner requests:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle richieste',
      error: error.message
    });
  }
});

/**
 * GET /api/virtual-tour-requests/admin/pending
 * Ottiene tutte le richieste pending per admin
 * Richiede autenticazione (solo Admin)
 */
router.get('/admin/pending', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo gli Admin possono accedere a questa risorsa'
      });
    }

    const requests = await sequelize.query(`
      SELECT
        vtr.id,
        vtr.property_id,
        vtr.partner_id,
        vtr.photos_folder,
        vtr.photos_count,
        vtr.notes,
        vtr.status,
        vtr.requested_at,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        part."companyName" as partner_name,
        part.email as partner_email
      FROM virtual_tour_requests vtr
      LEFT JOIN properties p ON vtr.property_id = p.id
      LEFT JOIN partners part ON vtr.partner_id = part.id
      WHERE vtr.status = 'pending'
      ORDER BY vtr.requested_at ASC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('❌ Error fetching admin requests:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle richieste',
      error: error.message
    });
  }
});

/**
 * POST /api/virtual-tour-requests/admin/complete
 * Completa richiesta virtual tour (admin incolla URL Kuula)
 * Richiede autenticazione (solo Admin)
 */
router.post('/admin/complete', authenticateToken, async (req, res) => {
  try {
    const { requestId, kууlaUrl, adminNotes } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo gli Admin possono completare richieste'
      });
    }

    // Validazione
    if (!requestId || !kууlaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Request ID e Kuula URL sono richiesti'
      });
    }

    // Recupera richiesta
    const [request] = await sequelize.query(`
      SELECT * FROM virtual_tour_requests WHERE id = :requestId
    `, {
      replacements: { requestId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }

    if (request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Questa richiesta è già stata completata'
      });
    }

    // Aggiorna richiesta
    await sequelize.query(`
      UPDATE virtual_tour_requests
      SET
        status = 'completed',
        kuula_url = :kууlaUrl,
        admin_notes = :adminNotes,
        processed_by = :adminId,
        completed_at = NOW()
      WHERE id = :requestId
    `, {
      replacements: {
        requestId,
        kууlaUrl,
        adminNotes: adminNotes || null,
        adminId: req.user.id
      }
    });

    // Aggiorna property con URL virtual tour
    await sequelize.query(`
      UPDATE properties
      SET
        "virtualTourUrl" = :kууlaUrl,
        "vtRequestStatus" = 'completed',
        "vtCompletedAt" = NOW()
      WHERE id = :propertyId
    `, {
      replacements: {
        propertyId: request.property_id,
        kууlaUrl
      }
    });

    // Decrementa credito dal partner
    await sequelize.query(`
      UPDATE partners
      SET vt_credits = vt_credits - 1
      WHERE id = :partnerId
    `, {
      replacements: { partnerId: request.partner_id }
    });

    // Registra utilizzo
    await sequelize.query(`
      INSERT INTO virtual_tour_usage (
        partner_id,
        property_id,
        tour_url,
        credits_used
      ) VALUES (
        :partnerId,
        :propertyId,
        :tourUrl,
        1
      )
    `, {
      replacements: {
        partnerId: request.partner_id,
        propertyId: request.property_id,
        tourUrl: kууlaUrl
      }
    });

    console.log(`✅ Virtual tour completato per property ${request.property_id} - URL: ${kууlaUrl}`);

    // Recupera info per notifica partner
    const [property] = await sequelize.query(`
      SELECT title FROM properties WHERE id = :propertyId
    `, {
      replacements: { propertyId: request.property_id },
      type: sequelize.QueryTypes.SELECT
    });

    const [partner] = await sequelize.query(`
      SELECT p.*, u.id as user_id, u.email, u."firstName", u."lastName"
      FROM partners p
      JOIN users u ON p."userId" = u.id
      WHERE p.id = :partnerId
    `, {
      replacements: { partnerId: request.partner_id },
      type: sequelize.QueryTypes.SELECT
    });

    // Invia notifica partner
    if (partner && property) {
      await notifyVirtualTourCompleted({
        userId: partner.user_id,
        userName: partner.companyName || `${partner.firstName} ${partner.lastName}`,
        userEmail: partner.email,
        propertyTitle: property.title,
        propertyId: request.property_id,
        tourUrl: kууlaUrl
      });
    }

    res.json({
      success: true,
      message: 'Virtual tour completato e pubblicato con successo!'
    });

  } catch (error) {
    console.error('❌ Error completing virtual tour:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel completamento del virtual tour',
      error: error.message
    });
  }
});

/**
 * POST /api/virtual-tour-requests/admin/reject
 * Rifiuta richiesta virtual tour
 * Richiede autenticazione (solo Admin)
 */
router.post('/admin/reject', authenticateToken, async (req, res) => {
  try {
    const { requestId, reason } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo gli Admin possono rifiutare richieste'
      });
    }

    if (!requestId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Request ID e motivo sono richiesti'
      });
    }

    const [request] = await sequelize.query(`
      SELECT * FROM virtual_tour_requests WHERE id = :requestId
    `, {
      replacements: { requestId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Richiesta non trovata'
      });
    }

    // Aggiorna richiesta
    await sequelize.query(`
      UPDATE virtual_tour_requests
      SET
        status = 'rejected',
        admin_notes = :reason,
        processed_by = :adminId,
        completed_at = NOW()
      WHERE id = :requestId
    `, {
      replacements: {
        requestId,
        reason,
        adminId: req.user.id
      }
    });

    // Aggiorna property
    await sequelize.query(`
      UPDATE properties
      SET "vtRequestStatus" = 'rejected'
      WHERE id = :propertyId
    `, {
      replacements: { propertyId: request.property_id }
    });

    console.log(`❌ Virtual tour rifiutato per property ${request.property_id}`);

    // Recupera info per notifica partner
    const [property] = await sequelize.query(`
      SELECT title FROM properties WHERE id = :propertyId
    `, {
      replacements: { propertyId: request.property_id },
      type: sequelize.QueryTypes.SELECT
    });

    const [partner] = await sequelize.query(`
      SELECT p.*, u.id as user_id, u.email, u."firstName", u."lastName"
      FROM partners p
      JOIN users u ON p."userId" = u.id
      WHERE p.id = :partnerId
    `, {
      replacements: { partnerId: request.partner_id },
      type: sequelize.QueryTypes.SELECT
    });

    // Invia notifica partner
    if (partner && property) {
      await notifyVirtualTourRejected({
        userId: partner.user_id,
        userName: partner.companyName || `${partner.firstName} ${partner.lastName}`,
        userEmail: partner.email,
        propertyTitle: property.title,
        propertyId: request.property_id,
        rejectionReason: reason
      });
    }

    res.json({
      success: true,
      message: 'Richiesta rifiutata'
    });

  } catch (error) {
    console.error('❌ Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel rifiuto della richiesta',
      error: error.message
    });
  }
});

export default router;
