import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import Partner from '../models/Partner.js';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../config/email.js';

const router = express.Router();

// __dirname equivalente per ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurazione Multer per upload documenti
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crea directory uploads/partners se non esiste
    const uploadPath = path.join(process.cwd(), 'uploads', 'partners');
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    } catch (err) {
      console.error('❌ Errore creazione directory uploads/partners:', err);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nome file: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Filtro file: solo PDF e immagini
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo file PDF o immagini (JPG, PNG) sono accettati'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max per file
  }
});

// POST /api/partners/register
// Registrazione nuovo partner con upload documenti
router.post('/register', upload.fields([
  { name: 'businessCertificate', maxCount: 1 }, // Visura Camerale
  { name: 'idDocument', maxCount: 1 }            // Documento Identità
]), async (req, res) => {
  try {
    console.log('📝 Nuova registrazione partner...');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    // Validazione campi obbligatori
    const {
      firstName,
      lastName,
      password,
      companyName,
      vatNumber,
      fiscalCode,
      address,
      city,
      province,
      zipCode,
      phone,
      email,
      website,
      acceptedTerms
    } = req.body;

    // Validazione base
    if (!firstName || !lastName || !password || !companyName || !vatNumber || !phone || !email) {
      return res.status(400).json({
        error: 'Campi obbligatori mancanti: firstName, lastName, password, companyName, vatNumber, phone, email'
      });
    }

    // Validazione password
    if (password.length < 6) {
      return res.status(400).json({
        error: 'La password deve essere di almeno 6 caratteri'
      });
    }

    // Validazione documenti - TEMPORANEAMENTE DISABILITATA
    // if (!req.files || !req.files.businessCertificate || !req.files.idDocument) {
    //   return res.status(400).json({
    //     error: 'Documenti obbligatori mancanti: Visura Camerale e Documento Identità'
    //   });
    // }

    // Validazione accettazione termini
    if (acceptedTerms !== 'true' && acceptedTerms !== true) {
      return res.status(400).json({
        error: 'Devi accettare i termini e condizioni'
      });
    }

    // Verifica se email esiste già (users o partners)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email già registrata nel sistema'
      });
    }

    // Verifica se partner esiste già (P.IVA)
    const existingPartner = await Partner.findOne({
      where: { vatNumber }
    });

    if (existingPartner) {
      return res.status(409).json({
        error: 'Partita IVA già registrata'
      });
    }

    // Path relativi dei file caricati - TEMPORANEAMENTE OPZIONALI
    const businessCertificatePath = req.files?.businessCertificate ? `/uploads/partners/${req.files.businessCertificate[0].filename}` : null;
    const idDocumentPath = req.files?.idDocument ? `/uploads/partners/${req.files.idDocument[0].filename}` : null;

    // 1. Crea prima il record User per l'autenticazione
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role: 'partner',
      isVerified: true // TEMPORANEAMENTE true - verifica email disabilitata
    });

    console.log('✅ User creato con ID:', newUser.id);

    // 2. Crea il Partner e collegalo al User
    const newPartner = await Partner.create({
      userId: newUser.id, // ✅ Collega al user appena creato
      companyName,
      vatNumber,
      fiscalCode: fiscalCode || null,
      address: address || null,
      city: city || null,
      province: province || null,
      zipCode: zipCode || null,
      phone,
      email,
      website: website || null,
      visuraCamerale: businessCertificatePath,
      documentoIdentita: idDocumentPath,
      termsAccepted: true,
      status: 'active' // TEMPORANEAMENTE active - approvazione admin disabilitata
    });

    console.log('✅ Partner registrato con successo:', newPartner.id);

    // Invia email di conferma registrazione (non bloccante)
    try {
      await sendEmail({
        to: newPartner.email,
        subject: '🏢 Benvenuto Partner AgenzieCase!',
        html: emailTemplates.partnerRegistration({
          companyName: newPartner.companyName
        }),
        text: `Benvenuto ${newPartner.companyName}! La tua registrazione partner su AgenzieCase è stata completata con successo.`
      });
      console.log('✅ Email di conferma inviata a:', newPartner.email);
    } catch (emailError) {
      console.error('❌ Errore invio email conferma:', emailError.message);
    }

    res.status(201).json({
      message: 'Registrazione completata con successo! Ti abbiamo inviato una email di conferma.',
      partner: {
        id: newPartner.id,
        companyName: newPartner.companyName,
        email: newPartner.email,
        status: newPartner.status
      }
    });

  } catch (error) {
    console.error('❌ Errore registrazione partner:', error);

    // Se è stato creato un user ma la creazione del partner fallisce, elimina il user
    // Questo previene user orfani nel database
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dati non validi',
        details: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Email o Partita IVA già registrati'
      });
    }

    res.status(500).json({
      error: 'Errore durante la registrazione',
      details: error.message
    });
  }
});

// IMPORTANTE: La route /me deve venire PRIMA della route /:id
// altrimenti Express interpreta "me" come un parametro :id

// GET /api/partners/me
// Ottieni profilo partner loggato
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Verifica che l'utente sia un Partner
    if (req.user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        error: 'Accesso negato. Solo i Partner possono accedere a questa risorsa.'
      });
    }

    // Trova il Partner associato all'utente loggato
    const partner = await Partner.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        }
      ]
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Profilo Partner non trovato'
      });
    }

    res.json({
      success: true,
      partner
    });
  } catch (error) {
    console.error('❌ Errore recupero profilo partner:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il recupero del profilo'
    });
  }
});

// GET /api/partners
// Lista tutti i partner (solo admin)
// GET /api/partners - Lista partners con paginazione
// TODO: Aggiungere middleware autenticazione admin
router.get('/', async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Partner.findAndCountAll({
      attributes: { exclude: ['businessCertificate', 'idDocument'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      partners: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('❌ Errore recupero partners:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

// GET /api/partners/:id
// Ottieni dettagli partner (per dashboard)
router.get('/:id', async (req, res) => {
  try {
    const partner = await Partner.findByPk(req.params.id, {
      attributes: { exclude: ['businessCertificate', 'idDocument'] } // Non esporre path documenti
    });

    if (!partner) {
      return res.status(404).json({ error: 'Partner non trovato' });
    }

    res.json(partner);
  } catch (error) {
    console.error('❌ Errore recupero partner:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

// PATCH /api/partners/:id/status
// Aggiorna status partner (solo admin)
// TODO: Aggiungere middleware autenticazione admin
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status non valido' });
    }

    const partner = await Partner.findByPk(req.params.id);

    if (!partner) {
      return res.status(404).json({ error: 'Partner non trovato' });
    }

    await partner.update({
      status,
      approvedAt: status === 'approved' ? new Date() : null
      // approvedBy: req.user.id // TODO: Da middleware auth
    });

    console.log(`✅ Partner ${partner.id} status aggiornato: ${status}`);

    // Invia email notifica cambio status (non bloccante)
    try {
      await sendEmail({
        to: partner.email,
        subject: '📢 Aggiornamento Stato Account Partner',
        html: emailTemplates.partnerStatusChange({
          companyName: partner.companyName,
          status
        }),
        text: `Ciao ${partner.companyName}, lo stato del tuo account è stato aggiornato a: ${status}.`
      });
      console.log('✅ Email notifica status inviata a:', partner.email);
    } catch (emailError) {
      console.error('❌ Errore invio email status:', emailError.message);
    }

    res.json({
      message: 'Status aggiornato con successo. Notifica email inviata al partner.',
      partner
    });

  } catch (error) {
    console.error('❌ Errore aggiornamento status:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

export default router;
