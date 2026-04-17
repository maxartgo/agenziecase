import express from 'express';
import {
  registerPartner,
  getCurrentPartner,
  updatePartner,
  uploadPartnerLogo,
  getSubscription,
  createSubscription
} from '../controllers/partnerController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { uploadDocuments, uploadLogo, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// ============================================
// ROUTES PUBBLICHE
// ============================================

// POST /api/partners/register - Registrazione nuovo partner
// Richiede upload di documenti (visuraCamerale, documentoIdentita)
router.post(
  '/register',
  uploadDocuments,
  handleUploadError,
  registerPartner
);

// ============================================
// ROUTES PROTETTE (richiedono autenticazione partner)
// ============================================

// GET /api/partners/me - Profilo partner corrente
router.get(
  '/me',
  authenticateToken,
  authorizeRoles('partner'),
  getCurrentPartner
);

// PUT /api/partners/me - Aggiorna profilo partner
router.put(
  '/me',
  authenticateToken,
  authorizeRoles('partner'),
  updatePartner
);

// PUT /api/partners/me/logo - Carica logo agenzia
router.put(
  '/me/logo',
  authenticateToken,
  authorizeRoles('partner'),
  uploadLogo,
  handleUploadError,
  uploadPartnerLogo
);

// GET /api/partners/subscription - Ottieni abbonamento attivo
router.get(
  '/subscription',
  authenticateToken,
  authorizeRoles('partner'),
  getSubscription
);

// POST /api/partners/subscription/create - Crea abbonamento (dopo pagamento)
router.post(
  '/subscription/create',
  authenticateToken,
  authorizeRoles('partner'),
  createSubscription
);

export default router;
