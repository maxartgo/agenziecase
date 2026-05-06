import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import { connectRedis as initRedis, disconnectRedis as closeRedis } from './config/redis.js';
import { performanceMiddleware, getPerformanceMetrics } from './middleware/performance.js';
import { setupSecurity, customSecurityHeaders } from './middleware/security.js';
import Property from './models/Property.js';
import Partner from './models/Partner.js';
import propertyRoutes from './routes/propertyRoutes.js';
import authRoutes from './routes/authRoutes.js';
import partnerRoutes from './routes/partners.js';
import agentRoutes from './routes/agentRoutes.js';
import voiceRoutes from './routes/voice.js';
import uploadRoutes from './routes/upload.js';
import virtualTourPacksRoutes from './routes/virtualTourPacks.js';
import virtualTourRequestsRoutes from './routes/virtualTourRequests.js';
import crmSubscriptionsRoutes from './routes/crmSubscriptions.js';
import adminCrmSubscriptionsRoutes from './routes/admin/crmSubscriptions.js';

// CRM Routes
import clientsRoutes from './routes/crm/clients.js';
import appointmentsRoutes from './routes/crm/appointments.js';
import dealsRoutes from './routes/crm/deals.js';
import activitiesRoutes from './routes/crm/activities.js';
import documentsRoutes from './routes/crm/documents.js';

// AI-CRM Integration
import aiCrmRoutes from './routes/ai-crm.js';

// Communications
import communicationsRoutes from './routes/communications.js';

// Support Tickets
import supportTicketsRoutes from './routes/supportTickets.js';
import adminSupportTicketsRoutes from './routes/admin/supportTickets.js';

// MLS (Multiple Listing Service)
import mlsRoutes from './routes/mls.js';

// Notifications
import notificationsRoutes from './routes/notifications.js';

// Performance Monitoring Routes
import performanceRoutes from './routes/performance.js';

// Admin Profile & Coupons
import adminProfileRoutes from './routes/adminProfile.js';
import discountCouponsRoutes from './routes/discountCoupons.js';

// Email Testing Routes
import testEmailRoutes from './routes/testEmail.js';

// Environment validation
import { validateEnvVariables } from './config/envValidation.js';

dotenv.config();

// Validate environment variables early
validateEnvVariables();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE - Must be first!
// ============================================================================
setupSecurity(app);                    // Helmet + CORS configurati
app.use(customSecurityHeaders);         // Headers sicurezza personalizzati

// ============================================================================
// PERFORMANCE MIDDLEWARE
// ============================================================================
app.use(performanceMiddleware);

// ============================================================================
// STANDARD MIDDLEWARE
// ============================================================================
app.use(compression());                 // Compressione risposte
app.use(express.json());                // Parsing JSON

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// System prompt per l'assistente immobiliare
const SYSTEM_PROMPT = `Sei l'assistente AI di AgenzieCase, un portale immobiliare italiano premium.

Il tuo compito è aiutare gli utenti a:
- Cercare immobili (vendita/affitto) in Italia
- Dare informazioni sul mercato immobiliare italiano
- Consigliare sulla scelta della casa ideale
- Rispondere a domande su mutui, tasse, documenti
- Fornire stime di prezzo per zona
- Aiutare a contattare gli agenti per visite e informazioni

REGOLE ASSOLUTE:
1. NON inventare mai nomi di persone, numeri di telefono, indirizzi email o dati di agenzie immobiliari.
2. Se l'utente chiede di contattare un'agenzia, usa SOLO i dati delle agenzie elencate nel contesto qui sotto.
3. Se non ci sono agenzie nel contesto per la città richiesta, di' chiaramente che non hai agenzie disponibili in quella zona e invita l'utente a usare il pulsante "Fissa Visita" sull'immobile di interesse.
4. Non menzionare mai agenti, numeri o email che non compaiono esplicitamente nel contesto fornito.

Hai accesso al database in tempo reale con tutti gli immobili e le agenzie partner disponibili.
Quando un utente chiede disponibilità o cerca immobili, userai i dati forniti nel contesto.

Rispondi sempre in italiano, in modo cordiale e professionale. Sii conciso ma utile.
Quando suggerisci immobili, menziona sempre il prezzo e le caratteristiche principali.
Se non ci sono immobili disponibili che corrispondono ai criteri, informa l'utente e suggerisci di ampliare la ricerca o contattare un agente.`;

// Endpoint per la chat con Groq (Llama 3.3 - velocissimo!)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Recupera le proprietà disponibili dal database
    const availableProperties = await Property.findAll({
      where: { status: 'disponibile' },
      attributes: ['id', 'title', 'description', 'city', 'location', 'price', 'sqm', 'rooms', 'bathrooms', 'type', 'propertyType', 'highlight', 'energyClass', 'hasParking', 'hasElevator', 'hasGarden', 'hasBalcony'],
      order: [['featured', 'DESC'], ['created_at', 'DESC']],
      limit: 50
    });

    // Recupera le agenzie partner attive
    const activePartners = await Partner.findAll({
      where: { status: 'active' },
      attributes: ['companyName', 'city', 'phone', 'email'],
      limit: 20
    });

    // Formatta il contesto per l'AI
    let propertyContext = '';
    if (availableProperties.length > 0) {
      propertyContext = '\n\nIMMOBILI DISPONIBILI:\n';
      availableProperties.forEach((prop, index) => {
        const price = prop.type === 'Affitto' ? `€${prop.price}/mese` : `€${Number(prop.price).toLocaleString('it-IT')}`;
        propertyContext += `${index + 1}. ${prop.title} - ${prop.city}, ${prop.location} - ${price} - ${prop.sqm}mq, ${prop.rooms} locali`;
        if (prop.propertyType) propertyContext += ` - ${prop.propertyType}`;
        if (prop.highlight) propertyContext += ` - ${prop.highlight}`;
        propertyContext += '\n';
      });
    } else {
      propertyContext = '\n\nAl momento non ci sono immobili disponibili nel database.';
    }

    if (activePartners.length > 0) {
      propertyContext += '\n\nAGENZIE PARTNER ATTIVE (usa SOLO queste):\n';
      activePartners.forEach((partner, index) => {
        propertyContext += `${index + 1}. ${partner.companyName} - ${partner.city || 'Italia'} - Tel: ${partner.phone || 'N/D'} - Email: ${partner.email || 'N/D'}\n`;
      });
    } else {
      propertyContext += '\n\nAl momento non ci sono agenzie partner attive nel database.';
    }

    // Costruisci l'array di messaggi per Groq
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + propertyContext },
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // Chiama l'API di Groq (stile OpenAI)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Groq API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Restituisci sia il messaggio dell'AI che i dati completi delle proprietà
    res.json({
      success: true,
      message: data.choices[0].message.content,
      properties: availableProperties.map(prop => ({
        id: prop.id,
        title: prop.title,
        description: prop.description,
        city: prop.city,
        location: prop.location,
        price: prop.price,
        sqm: prop.sqm,
        rooms: prop.rooms,
        bathrooms: prop.bathrooms,
        type: prop.type,
        propertyType: prop.propertyType,
        highlight: prop.highlight,
        energyClass: prop.energyClass,
        hasParking: prop.hasParking,
        hasElevator: prop.hasElevator,
        hasGarden: prop.hasGarden,
        hasBalcony: prop.hasBalcony,
        images: prop.images,
        mainImage: prop.mainImage
      }))
    });

  } catch (error) {
    console.error('Errore API Groq:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint per ricerca AI con Groq
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `${SYSTEM_PROMPT}

Quando ricevi una ricerca, rispondi SOLO con un JSON valido nel formato:
{
  "results": ["id1", "id2", ...],
  "explanation": "breve spiegazione"
}

Gli ID disponibili sono: 1, 2, 3, 4, 5, 6, 7, 8`
          },
          { role: 'user', content: `Cerca immobili: ${query}` }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Groq API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data.choices[0].message.content
    });

  } catch (error) {
    console.error('Errore ricerca:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ROUTES
// ============================================

// Auth API Routes
app.use('/api/auth', authRoutes);

// Properties API Routes
app.use('/api/properties', propertyRoutes);

// Partner API Routes
app.use('/api/partners', partnerRoutes);

// Agent API Routes
app.use('/api/agents', agentRoutes);

// Voice API Routes
app.use('/api/voice', voiceRoutes);

// Upload API Routes
app.use('/api/upload', uploadRoutes);

// Virtual Tour Packs API Routes
app.use('/api/virtual-tour-packs', virtualTourPacksRoutes);

// Virtual Tour Requests API Routes
app.use('/api/virtual-tour-requests', virtualTourRequestsRoutes);

// CRM Subscriptions API Routes
app.use('/api/crm-subscriptions', crmSubscriptionsRoutes);

// Admin CRM Subscriptions API Routes
app.use('/api/admin/crm-subscriptions', adminCrmSubscriptionsRoutes);

// CRM API Routes (temporarily disabled for testing)
app.use('/api/crm/clients', clientsRoutes);
app.use('/api/crm/appointments', appointmentsRoutes);
app.use('/api/crm/deals', dealsRoutes);
app.use('/api/crm/activities', activitiesRoutes);
app.use('/api/crm/documents', documentsRoutes);

// AI-CRM Integration Routes
app.use('/api/ai-crm', aiCrmRoutes);

// Communications Routes
app.use('/api/communications', communicationsRoutes);

// Support Tickets Routes
app.use('/api/support-tickets', supportTicketsRoutes);
app.use('/api/admin/support-tickets', adminSupportTicketsRoutes);

// MLS Routes
app.use('/api/mls', mlsRoutes);

// Notifications Routes
app.use('/api/notifications', notificationsRoutes);

// Performance Monitoring Routes
app.use('/api/performance', performanceRoutes);

// Admin Profile & Coupons
app.use('/api/admin/profile', adminProfileRoutes);
app.use('/api/admin/coupons', discountCouponsRoutes);

// Email testing routes (development/testing)
app.use('/api/test', testEmailRoutes);

// Endpoint di test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server AgenzieCase attivo' });
});

// Performance metrics endpoint
app.get('/api/performance/metrics', (req, res) => {
  const metrics = getPerformanceMetrics();
  res.json({
    success: true,
    metrics
  });
});

// ============================================
// AVVIO SERVER
// ============================================
const PORT = process.env.PORT || 3002;

const startServer = async () => {
  // Test connessione database
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('⚠️ Server avviato ma database non connesso');
  }

  // Initialize Redis (optional - server will work without it)
  const redisConnected = await initRedis();

  if (redisConnected) {
    console.log('✅ Redis cache layer attivo');
  } else {
    console.log('⚠️ Redis non disponibile - cache disabilitato');
  }

  app.listen(PORT, () => {
    console.log(`\n🏠 Server AgenzieCase attivo su http://localhost:${PORT}`);
    console.log(`\n📡 Endpoint disponibili:`);
    console.log(`   GET    /api/health - Health check`);
    console.log(`   POST   /api/chat - Chat con AI`);
    console.log(`   POST   /api/search - Ricerca AI`);
    console.log(`\n👤 Auth API:`);
    console.log(`   POST   /api/auth/register - Registrazione utente`);
    console.log(`   POST   /api/auth/login - Login utente`);
    console.log(`   GET    /api/auth/me - Profilo utente (protected)`);
    console.log(`   PUT    /api/auth/me - Aggiorna profilo (protected)`);
    console.log(`   POST   /api/auth/change-password - Cambia password (protected)`);
    console.log(`\n🏘️  Properties API:`);
    console.log(`   GET    /api/properties - Lista immobili (con filtri)`);
    console.log(`   GET    /api/properties/featured - Immobili in evidenza`);
    console.log(`   GET    /api/properties/stats - Statistiche`);
    console.log(`   GET    /api/properties/:id - Dettaglio immobile`);
    console.log(`   POST   /api/properties - Crea immobile`);
    console.log(`   PUT    /api/properties/:id - Aggiorna immobile`);
    console.log(`   DELETE /api/properties/:id - Elimina immobile`);
    console.log(`\n🤝 Partner API:`);
    console.log(`   POST   /api/partners/register - Registrazione partner (con upload documenti)`);
    console.log(`   GET    /api/partners/me - Profilo partner (protected)`);
    console.log(`   PUT    /api/partners/me - Aggiorna profilo (protected)`);
    console.log(`   PUT    /api/partners/me/logo - Upload logo (protected)`);
    console.log(`   GET    /api/partners/subscription - Abbonamento attivo (protected)`);
    console.log(`   POST   /api/partners/subscription/create - Crea abbonamento (protected)`);
    console.log(`\n🎤 Voice API:`);
    console.log(`   POST   /api/voice/text-to-speech - Text-to-Speech (Google Cloud)`);
    console.log(`\n📊 CRM API - Clienti:`);
    console.log(`   GET    /api/crm/clients - Lista clienti (con filtri)`);
    console.log(`   GET    /api/crm/clients/:id - Dettaglio cliente`);
    console.log(`   POST   /api/crm/clients - Crea cliente`);
    console.log(`   PUT    /api/crm/clients/:id - Aggiorna cliente`);
    console.log(`   DELETE /api/crm/clients/:id - Elimina cliente`);
    console.log(`   GET    /api/crm/clients/stats/:partnerId - Statistiche clienti`);
    console.log(`\n📅 CRM API - Appuntamenti:`);
    console.log(`   GET    /api/crm/appointments - Lista appuntamenti`);
    console.log(`   GET    /api/crm/appointments/:id - Dettaglio appuntamento`);
    console.log(`   POST   /api/crm/appointments - Crea appuntamento`);
    console.log(`   PUT    /api/crm/appointments/:id - Aggiorna appuntamento`);
    console.log(`   DELETE /api/crm/appointments/:id - Elimina appuntamento`);
    console.log(`   GET    /api/crm/appointments/calendar/:partnerId - Calendario`);
    console.log(`   GET    /api/crm/appointments/stats/:partnerId - Statistiche`);
    console.log(`\n💼 CRM API - Trattative:`);
    console.log(`   GET    /api/crm/deals - Lista trattative`);
    console.log(`   GET    /api/crm/deals/:id - Dettaglio trattativa`);
    console.log(`   POST   /api/crm/deals - Crea trattativa`);
    console.log(`   PUT    /api/crm/deals/:id - Aggiorna trattativa`);
    console.log(`   DELETE /api/crm/deals/:id - Elimina trattativa`);
    console.log(`   GET    /api/crm/deals/pipeline/:partnerId - Sales Pipeline`);
    console.log(`   GET    /api/crm/deals/stats/:partnerId - Statistiche`);
    console.log(`\n📝 CRM API - Attività:`);
    console.log(`   GET    /api/crm/activities - Lista attività`);
    console.log(`   GET    /api/crm/activities/:id - Dettaglio attività`);
    console.log(`   POST   /api/crm/activities - Crea attività`);
    console.log(`   PUT    /api/crm/activities/:id - Aggiorna attività`);
    console.log(`   DELETE /api/crm/activities/:id - Elimina attività`);
    console.log(`   GET    /api/crm/activities/timeline/:partnerId - Timeline`);
    console.log(`   GET    /api/crm/activities/tasks/:partnerId - Tasks`);
    console.log(`   GET    /api/crm/activities/stats/:partnerId - Statistiche`);
    console.log(`\n📄 CRM API - Documenti:`);
    console.log(`   GET    /api/crm/documents - Lista documenti`);
    console.log(`   GET    /api/crm/documents/:id - Dettaglio documento`);
    console.log(`   POST   /api/crm/documents/upload - Upload documento`);
    console.log(`   PUT    /api/crm/documents/:id - Aggiorna documento`);
    console.log(`   DELETE /api/crm/documents/:id - Elimina documento`);
    console.log(`   GET    /api/crm/documents/download/:id - Download documento`);
    console.log(`   GET    /api/crm/documents/stats/:partnerId - Statistiche`);
    console.log(`\n🤖 AI-CRM Integration:`);
    console.log(`   POST   /api/ai-crm/chat - Chat AI con integrazione CRM`);
    console.log(`   POST   /api/ai-crm/create-appointment - Crea appuntamento da AI`);
    console.log(`   POST   /api/ai-crm/create-lead - Crea lead da AI`);
    console.log(`   POST   /api/ai-crm/calculate-mortgage - Calcola mutuo`);
    console.log(`   POST   /api/ai-crm/match-agency - Trova agenzia più adatta`);
    console.log(`\n📧 Communications API:`);
    console.log(`   POST   /api/communications/send-appointment-confirmation - Invia conferma appuntamento`);
    console.log(`   POST   /api/communications/send-lead-confirmation - Invia conferma lead`);
    console.log(`   POST   /api/communications/send-valuation-request - Invia richiesta valutazione`);
    console.log(`   POST   /api/communications/generate-whatsapp-link - Genera link WhatsApp\n`);
  });
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}. Closing server gracefully...`);

  // Close Redis connection
  await closeRedis();

  console.log('✅ Server shut down successfully');
  process.exit(0);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
