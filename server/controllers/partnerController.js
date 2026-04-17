import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Partner, Subscription } from '../models/index.js';

// Funzione per generare JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/partners/register - Registrazione nuovo partner
export const registerPartner = async (req, res) => {
  try {
    const {
      // Dati utente
      email,
      password,
      firstName,
      lastName,
      phone,
      // Dati aziendali
      companyName,
      vatNumber,
      fiscalCode,
      address,
      city,
      province,
      zipCode,
      companyPhone,
      companyEmail,
      website,
      // Accettazione termini
      termsAccepted,
      privacyAccepted
    } = req.body;

    // Validazione campi obbligatori
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, nome e cognome sono obbligatori'
      });
    }

    if (!companyName || !vatNumber || !address || !city || !companyPhone) {
      return res.status(400).json({
        success: false,
        error: 'Tutti i dati aziendali obbligatori devono essere forniti'
      });
    }

    // Validazione documenti
    if (!req.files || !req.files.visuraCamerale || !req.files.documentoIdentita) {
      return res.status(400).json({
        success: false,
        error: 'È necessario caricare sia la Visura Camerale che il Documento d\'Identità'
      });
    }

    // Validazione accettazione termini
    if (!termsAccepted || !privacyAccepted) {
      return res.status(400).json({
        success: false,
        error: 'È necessario accettare i termini e condizioni e la privacy policy'
      });
    }

    // Verifica se l'email è già registrata
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email già registrata'
      });
    }

    // Verifica se la partita IVA è già registrata
    const existingPartner = await Partner.findOne({ where: { vatNumber } });
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        error: 'Partita IVA già registrata'
      });
    }

    // Hash della password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crea l'utente
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role: 'partner', // Ruolo partner
      isVerified: false // Sarà verificato dopo l'approvazione
    });

    // URL dei documenti caricati
    const visuraCameraleUrl = `/uploads/documents/${req.files.visuraCamerale[0].filename}`;
    const documentoIdentitaUrl = `/uploads/documents/${req.files.documentoIdentita[0].filename}`;

    // Crea il profilo partner
    const newPartner = await Partner.create({
      userId: newUser.id,
      companyName,
      vatNumber,
      fiscalCode,
      address,
      city,
      province,
      zipCode,
      phone: companyPhone,
      email: companyEmail || email,
      website,
      visuraCamerale: visuraCameraleUrl,
      documentoIdentita: documentoIdentitaUrl,
      termsAccepted: true,
      privacyAccepted: true,
      termsAcceptedAt: new Date(),
      status: 'pending' // In attesa di approvazione e pagamento
    });

    // Genera token JWT
    const token = generateToken(newUser.id);

    // Risposta
    res.status(201).json({
      success: true,
      message: 'Registrazione partner completata. In attesa di approvazione e attivazione abbonamento.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      },
      partner: {
        id: newPartner.id,
        companyName: newPartner.companyName,
        status: newPartner.status
      }
    });

  } catch (error) {
    console.error('Errore registrazione partner:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la registrazione del partner'
    });
  }
};

// GET /api/partners/me - Ottieni profilo partner corrente
export const getCurrentPartner = async (req, res) => {
  try {
    const partner = await Partner.findOne({
      where: { userId: req.user.id },
      include: [
        {
          association: 'owner',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
        },
        {
          association: 'activeSubscription',
          attributes: ['id', 'plan', 'status', 'startDate', 'endDate', 'maxAgents', 'maxProperties']
        }
      ]
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Profilo partner non trovato'
      });
    }

    res.json({
      success: true,
      partner
    });

  } catch (error) {
    console.error('Errore getCurrentPartner:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il recupero del profilo partner'
    });
  }
};

// PUT /api/partners/me - Aggiorna profilo partner
export const updatePartner = async (req, res) => {
  try {
    const {
      companyName,
      address,
      city,
      province,
      zipCode,
      phone,
      email,
      website
    } = req.body;

    const partner = await Partner.findOne({ where: { userId: req.user.id } });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Profilo partner non trovato'
      });
    }

    // Aggiorna solo i campi forniti
    if (companyName) partner.companyName = companyName;
    if (address) partner.address = address;
    if (city) partner.city = city;
    if (province) partner.province = province;
    if (zipCode) partner.zipCode = zipCode;
    if (phone) partner.phone = phone;
    if (email) partner.email = email;
    if (website !== undefined) partner.website = website;

    await partner.save();

    res.json({
      success: true,
      message: 'Profilo partner aggiornato con successo',
      partner
    });

  } catch (error) {
    console.error('Errore updatePartner:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'aggiornamento del profilo partner'
    });
  }
};

// PUT /api/partners/me/logo - Carica logo agenzia
export const uploadPartnerLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    const partner = await Partner.findOne({ where: { userId: req.user.id } });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Profilo partner non trovato'
      });
    }

    // URL del logo caricato
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    partner.logo = logoUrl;
    await partner.save();

    res.json({
      success: true,
      message: 'Logo caricato con successo',
      logoUrl
    });

  } catch (error) {
    console.error('Errore uploadPartnerLogo:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il caricamento del logo'
    });
  }
};

// GET /api/partners/subscription - Ottieni abbonamento attivo
export const getSubscription = async (req, res) => {
  try {
    const partner = await Partner.findOne({
      where: { userId: req.user.id },
      include: [{
        association: 'activeSubscription'
      }]
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Profilo partner non trovato'
      });
    }

    res.json({
      success: true,
      subscription: partner.activeSubscription
    });

  } catch (error) {
    console.error('Errore getSubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il recupero dell\'abbonamento'
    });
  }
};

// POST /api/partners/subscription/create - Crea nuovo abbonamento (dopo pagamento)
export const createSubscription = async (req, res) => {
  try {
    const {
      plan,
      paymentMethod,
      paymentId
    } = req.body;

    if (!plan || !paymentMethod || !paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Piano, metodo di pagamento e ID pagamento sono obbligatori'
      });
    }

    const partner = await Partner.findOne({ where: { userId: req.user.id } });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Profilo partner non trovato'
      });
    }

    // Configurazione piani (da spostare eventualmente in un config file)
    const plans = {
      starter: {
        name: 'Piano Starter',
        price: 299.00,
        maxAgents: 1,
        maxProperties: 50
      },
      professional: {
        name: 'Piano Professional',
        price: 599.00,
        maxAgents: 5,
        maxProperties: 200
      },
      enterprise: {
        name: 'Piano Enterprise',
        price: 1199.00,
        maxAgents: 20,
        maxProperties: 1000
      }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        error: 'Piano non valido'
      });
    }

    // Calcola date (1 anno di durata)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Crea l'abbonamento
    const subscription = await Subscription.create({
      partnerId: partner.id,
      plan,
      planName: selectedPlan.name,
      price: selectedPlan.price,
      maxAgents: selectedPlan.maxAgents,
      maxProperties: selectedPlan.maxProperties,
      startDate,
      endDate,
      status: 'active',
      paymentMethod,
      paymentId,
      paymentDate: new Date()
    });

    // Aggiorna partner
    partner.subscriptionId = subscription.id;
    partner.status = 'active';
    await partner.save();

    res.status(201).json({
      success: true,
      message: 'Abbonamento attivato con successo',
      subscription
    });

  } catch (error) {
    console.error('Errore createSubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la creazione dell\'abbonamento'
    });
  }
};
