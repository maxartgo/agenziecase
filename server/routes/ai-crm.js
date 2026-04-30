import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { Partner, Agent, Property, Client, Appointment, Deal, Activity, User } from '../models/index.js';
import { Op } from 'sequelize';
import {
  sendEmail,
  generateAgentAppointmentNotification,
  generateAgentLeadNotification
} from '../utils/communications.js';
import {
  notifyAIAppointmentCreated,
  notifyAgentNewAIAppointment,
  notifyValuationRequestCreated,
  notifyAgentValuationRequest,
  notifyLeadCreated,
  notifyAgentNewLead
} from '../services/notificationService.js';

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ============================================
// SYSTEM PROMPT AVANZATO PER AI-CRM
// ============================================
const AI_CRM_SYSTEM_PROMPT = `Sei l'assistente AI di AgenzieCase, un portale immobiliare italiano premium con sistema CRM integrato.

## TUE CAPACITÀ:

### 1. INFORMAZIONI AGENZIE
- Conosci tutte le agenzie partner registrate
- Puoi fornire dettagli su agenti, specializzazioni, zone coperte
- Puoi consigliare l'agenzia più adatta in base alle esigenze

### 2. PRENDERE APPUNTAMENTI
- Puoi fissare appuntamenti per visite immobili
- Puoi organizzare videochiamate con agenti
- Puoi schedulare incontri in agenzia
- Confermi sempre data, ora, tipo appuntamento

### 3. VALUTAZIONE IMMOBILI
- Puoi fornire stime di valore basate su zona, mq, caratteristiche
- Crei automaticamente lead per valutazioni professionali
- Metti in contatto con agente specializzato in valutazioni

### 4. PREVENTIVI MUTUO
- Calcoli rate mensili mutuo
- Consideri: importo, durata, tasso interesse
- Formula: Rata = P * [r(1+r)^n] / [(1+r)^n - 1]
  dove P=capitale, r=tasso mensile, n=numero rate

### 5. MATCHING INTELLIGENTE
- Analizzi richieste cliente (budget, zona, tipo, esigenze)
- Trovi agenzie/agenti specializzati
- Proponi immobili compatibili
- Crei lead qualificati nel CRM

### 6. COMUNICAZIONI
- Puoi inviare email riepilogative
- Puoi generare messaggi WhatsApp
- Fornisci template pronti per contatti

## FORMATO RISPOSTE:

Quando l'utente richiede un'azione CRM, rispondi SEMPRE con JSON:

{
  "action": "create_appointment|create_lead|match_agency|calculate_mortgage|send_contact",
  "message": "messaggio amichevole per l'utente",
  "data": {
    // dati specifici per l'azione
  }
}

### ESEMPI:

**Richiesta appuntamento:**
{
  "action": "create_appointment",
  "message": "Perfetto! Ho prenotato un appuntamento per visitare l'appartamento in Via Roma 15 con l'agente Mario Rossi per giovedì 12 dicembre alle 15:00.",
  "data": {
    "type": "viewing",
    "propertyId": 123,
    "agentId": 45,
    "date": "2025-12-12T15:00:00",
    "clientName": "Luca Bianchi",
    "clientEmail": "luca@email.com",
    "clientPhone": "333-1234567"
  }
}

**Richiesta valutazione:**
{
  "action": "create_lead",
  "message": "Ho registrato la tua richiesta di valutazione per l'appartamento a Milano, zona Lambrate, 80mq. Ti contatterà l'agente specializzato Anna Verdi entro 24 ore per fissare un sopralluogo.",
  "data": {
    "type": "seller",
    "propertyType": "apartment",
    "location": "Milano, Lambrate",
    "size": 80,
    "clientName": "Marco Neri",
    "clientEmail": "marco@email.com",
    "clientPhone": "333-9876543",
    "agentId": 67
  }
}

**Calcolo mutuo:**
{
  "action": "calculate_mortgage",
  "message": "Per un mutuo di €200.000 a 25 anni con tasso fisso 3.5%, la rata mensile sarà di circa €1.001. Vuoi che ti metta in contatto con un consulente mutui della nostra agenzia partner?",
  "data": {
    "amount": 200000,
    "years": 25,
    "rate": 3.5,
    "monthlyPayment": 1001
  }
}

**Matching agenzia:**
{
  "action": "match_agency",
  "message": "In base alle tue esigenze (trilocale, Milano zona Navigli, budget €350.000), ti consiglio l'Agenzia ImmobilCasa che ha 5 appartamenti in quella zona. Il loro agente specializzato è Laura Blu, esperta del quartiere da 10 anni.",
  "data": {
    "partnerId": 12,
    "partnerName": "ImmobilCasa",
    "agentId": 89,
    "agentName": "Laura Blu",
    "matchingProperties": 5,
    "reason": "Specializzazione zona Navigli, portfolio ampio"
  }
}

## REGOLE IMPORTANTI:

1. **Dati personali**: Chiedi SEMPRE nome, email, telefono prima di creare lead/appuntamenti
2. **Conferme**: Riepilogare sempre i dettagli prima di finalizzare
3. **Privacy**: Spiega che i dati saranno condivisi solo con l'agenzia scelta
4. **Professionalità**: Tono cordiale ma professionale
5. **Chiarezza**: Se mancano informazioni, chiedi invece di assumere

Rispondi sempre in italiano, sii preciso e proattivo nell'aiutare l'utente.`;

// ============================================
// POST /api/ai-crm/chat - Chat AI con integrazione CRM
// ============================================
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], userContext = {} } = req.body;

    // Recupera contesto agenzie/agenti disponibili
    const partners = await Partner.findAll({
      where: { status: 'approved' },
      include: [{
        model: Agent,
        as: 'agents',
        where: { status: 'active' },
        required: false
      }],
      limit: 20
    });

    // Recupera immobili disponibili (sample per contesto)
    const properties = await Property.findAll({
      where: { status: 'available' },
      include: [{
        model: Partner,
        as: 'agency',
        attributes: ['id', 'companyName', 'city']
      }],
      limit: 50
    });

    // Costruisci contesto dinamico
    const contextInfo = `
## AGENZIE DISPONIBILI (${partners.length}):
${partners.map(p => `
- ${p.companyName} (${p.city})
  Agenti: ${p.agents?.map(a => `${a.firstName} ${a.lastName}`).join(', ') || 'nessuno'}
`).join('\n')}

## IMMOBILI DISPONIBILI (${properties.length}):
${properties.slice(0, 20).map(prop => `
- ${prop.title} | ${prop.city} | €${prop.price?.toLocaleString()} | ${prop.propertyType} | ${prop.squareMeters}mq | Agenzia: ${prop.agency?.companyName}
`).join('\n')}

## CONTESTO UTENTE:
${userContext.name ? `Nome: ${userContext.name}` : ''}
${userContext.email ? `Email: ${userContext.email}` : ''}
${userContext.phone ? `Telefono: ${userContext.phone}` : ''}
${userContext.preferences ? `Preferenze: ${JSON.stringify(userContext.preferences)}` : ''}
`;

    // Costruisci messaggi per Claude
    const messages = [
      ...history.map(m => ({
        role: m.role,
        content: m.content
      })),
      {
        role: 'user',
        content: `${contextInfo}\n\nDomanda utente: ${message}`
      }
    ];

    // Chiama Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: AI_CRM_SYSTEM_PROMPT,
      messages: messages
    });

    const aiResponse = response.content[0].text;

    // Prova a parsare se è JSON (azione CRM)
    let parsedResponse = null;
    let isAction = false;

    try {
      // Cerca JSON nel testo
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
        if (parsedResponse.action) {
          isAction = true;
        }
      }
    } catch (e) {
      // Non è JSON, è una risposta normale
    }

    res.json({
      success: true,
      message: isAction ? parsedResponse.message : aiResponse,
      action: isAction ? parsedResponse.action : null,
      data: isAction ? parsedResponse.data : null,
      rawResponse: aiResponse
    });

  } catch (error) {
    console.error('Errore AI-CRM chat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/ai-crm/create-appointment - Crea appuntamento da AI
// ============================================
router.post('/create-appointment', async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      propertyId,
      agentId,
      partnerId,
      date,
      type = 'viewing',
      notes
    } = req.body;

    // Validazione
    if (!clientName || !clientEmail || !clientPhone || !agentId || !partnerId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Dati mancanti: clientName, clientEmail, clientPhone, agentId, partnerId, date sono obbligatori'
      });
    }

    // Validazione GDPR
    if (!req.body.privacyConsent) {
      return res.status(400).json({
        success: false,
        error: 'Consenso privacy richiesto',
        requiresConfirmation: true,
        message: 'Per procedere è necessario accettare la privacy policy'
      });
    }

    // Trova o crea cliente
    let client = await Client.findOne({
      where: {
        email: clientEmail,
        partnerId
      }
    });

    if (!client) {
      // Estrai nome e cognome
      const nameParts = clientName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      client = await Client.create({
        firstName,
        lastName,
        email: clientEmail,
        phone: clientPhone,
        type: 'buyer',
        status: 'new',
        source: 'chat',
        priority: 'medium',
        partnerId,
        agentId,
        privacyConsent: true,
        privacyConsentDate: new Date(),
        privacyConsentSource: 'chat'
      });

      // Activity log creazione cliente
      await Activity.create({
        type: 'note',
        subject: 'Cliente creato da AI',
        content: `Nuovo cliente creato tramite assistente AI: ${clientName}`,
        activityDate: new Date(),
        clientId: client.id,
        agentId,
        partnerId
      });
    }

    // Crea appuntamento
    const appointmentDate = new Date(date);
    const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000); // +1 ora

    // Controllo conflitti: verifica se l'agente ha già un appuntamento in questo orario
    const conflictingAppointment = await Appointment.findOne({
      where: {
        agentId,
        status: { [Op.ne]: 'cancelled' }, // Escludi appuntamenti cancellati
        [Op.or]: [
          // Caso 1: Nuovo appuntamento inizia durante un appuntamento esistente
          {
            startDate: { [Op.lte]: appointmentDate },
            endDate: { [Op.gt]: appointmentDate }
          },
          // Caso 2: Nuovo appuntamento finisce durante un appuntamento esistente
          {
            startDate: { [Op.lt]: endDate },
            endDate: { [Op.gte]: endDate }
          },
          // Caso 3: Nuovo appuntamento contiene completamente un appuntamento esistente
          {
            startDate: { [Op.gte]: appointmentDate },
            endDate: { [Op.lte]: endDate }
          }
        ]
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        error: 'L\'agente ha già un appuntamento programmato in questo orario',
        conflictingAppointment: {
          startDate: conflictingAppointment.startDate,
          endDate: conflictingAppointment.endDate,
          title: conflictingAppointment.title
        }
      });
    }

    const appointment = await Appointment.create({
      title: `${type === 'viewing' ? 'Visita immobile' : 'Appuntamento'} - ${clientName}`,
      description: notes || `Appuntamento creato tramite assistente AI`,
      startDate: appointmentDate,
      endDate: endDate,
      type,
      status: 'scheduled',
      clientId: client.id,
      propertyId: propertyId || null,
      agentId,
      partnerId,
      notes
    });

    // Activity log appuntamento
    await Activity.create({
      type: 'note',
      subject: 'Appuntamento creato da AI',
      content: `Appuntamento fissato per ${appointmentDate.toLocaleString('it-IT')}`,
      activityDate: new Date(),
      clientId: client.id,
      propertyId: propertyId || null,
      appointmentId: appointment.id,
      agentId,
      partnerId
    });

    // Recupera agente, property e user per notifiche
    const agent = await Agent.findByPk(agentId, {
      include: [{ model: User, as: 'user' }]
    });
    const property = propertyId ? await Property.findByPk(propertyId) : null;

    // Ottieni userId del cliente se esiste
    const clientUser = await User.findOne({ where: { email: clientEmail } });

    // Notifica al cliente (se ha un account)
    if (clientUser) {
      await notifyAIAppointmentCreated({
        clientUserId: clientUser.id,
        clientName,
        clientEmail,
        agentName: `${agent.firstName} ${agent.lastName}`,
        propertyTitle: property ? property.title : 'Consulenza generale',
        appointmentDate: appointmentDate.toISOString(),
        appointmentType: type,
        appointmentId: appointment.id
      });
    }

    // Notifica all'agente
    if (agent && agent.user) {
      await notifyAgentNewAIAppointment({
        agentUserId: agent.user.id,
        agentName: `${agent.firstName} ${agent.lastName}`,
        agentEmail: agent.email,
        clientName,
        clientEmail,
        clientPhone,
        propertyTitle: property ? property.title : 'Consulenza generale',
        appointmentDate: appointmentDate.toISOString(),
        appointmentType: type,
        notes: notes || '',
        appointmentId: appointment.id
      });
    }

    res.json({
      success: true,
      appointment,
      client,
      message: 'Appuntamento creato con successo. Notifiche inviate a cliente e agente.'
    });

  } catch (error) {
    console.error('Errore creazione appuntamento AI:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/ai-crm/create-lead - Crea lead da AI
// ============================================
router.post('/create-lead', async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      type, // buyer, seller, renter, landlord
      propertyType,
      location,
      budgetMin,
      budgetMax,
      size,
      notes,
      agentId,
      partnerId
    } = req.body;

    // Validazione
    if (!clientName || !clientEmail || !clientPhone || !type || !partnerId) {
      return res.status(400).json({
        success: false,
        error: 'Dati mancanti: clientName, clientEmail, clientPhone, type, partnerId sono obbligatori'
      });
    }

    // Validazione GDPR
    if (!req.body.privacyConsent) {
      return res.status(400).json({
        success: false,
        error: 'Consenso privacy richiesto',
        requiresConfirmation: true,
        message: 'Per procedere è necessario accettare la privacy policy'
      });
    }

    // Trova o crea cliente
    let client = await Client.findOne({
      where: {
        email: clientEmail,
        partnerId
      }
    });

    if (!client) {
      const nameParts = clientName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      client = await Client.create({
        firstName,
        lastName,
        email: clientEmail,
        phone: clientPhone,
        type,
        status: 'new',
        source: 'chat',
        priority: 'high', // Lead da AI = alta priorità
        budgetMin,
        budgetMax,
        preferredPropertyType: propertyType,
        preferredLocations: location ? JSON.stringify([location]) : null,
        notes,
        partnerId,
        agentId,
        privacyConsent: true,
        privacyConsentDate: new Date(),
        privacyConsentSource: 'chat'
      });
    } else {
      // Aggiorna info esistenti
      await client.update({
        type,
        budgetMin: budgetMin || client.budgetMin,
        budgetMax: budgetMax || client.budgetMax,
        preferredPropertyType: propertyType || client.preferredPropertyType,
        preferredLocations: location ? JSON.stringify([location]) : client.preferredLocations,
        notes: notes ? (client.notes ? `${client.notes}\n\n${notes}` : notes) : client.notes
      });
    }

    // Crea Deal (trattativa)
    const deal = await Deal.create({
      title: `Lead AI - ${type} - ${clientName}`,
      description: `Lead generato da assistente AI.\nTipo: ${type}\nZona: ${location || 'Non specificata'}\nBudget: €${budgetMin?.toLocaleString() || 'N/A'} - €${budgetMax?.toLocaleString() || 'N/A'}`,
      type: type === 'buyer' ? 'buy' : type === 'seller' ? 'sale' : 'rent',
      stage: 'lead',
      value: budgetMax || budgetMin || null,
      probability: 30, // Lead freddo
      priority: 'high',
      clientId: client.id,
      agentId: agentId || client.agentId,
      partnerId,
      notes
    });

    // Activity log
    await Activity.create({
      type: 'note',
      subject: 'Lead creato da AI',
      content: `Nuovo lead generato tramite assistente AI.\nTipo: ${type}\nRichiesta: ${propertyType || 'generica'} in zona ${location || 'da definire'}`,
      activityDate: new Date(),
      clientId: client.id,
      dealId: deal.id,
      agentId: agentId || client.agentId,
      partnerId
    });

    // Recupera agente e user per notifiche
    const assignedAgentId = agentId || client.agentId;
    const agent = assignedAgentId ? await Agent.findByPk(assignedAgentId, {
      include: [{ model: User, as: 'user' }]
    }) : null;

    // Ottieni userId del cliente se esiste
    const clientUser = await User.findOne({ where: { email: clientEmail } });

    // Invia notifiche in base al tipo di lead
    if (type === 'seller' && location && size) {
      // Richiesta di valutazione (seller) - notifiche specifiche
      // Notifica al cliente (se ha un account)
      if (clientUser) {
        await notifyValuationRequestCreated({
          clientUserId: clientUser.id,
          clientName,
          clientEmail,
          propertyAddress: location,
          propertyType: propertyType || 'Non specificato',
          valuationId: deal.id
        });
      }

      // Notifica all'agente
      if (agent && agent.user) {
        await notifyAgentValuationRequest({
          agentUserId: agent.user.id,
          agentName: `${agent.firstName} ${agent.lastName}`,
          agentEmail: agent.email,
          clientName,
          clientEmail,
          clientPhone,
          propertyAddress: location,
          propertyType: propertyType || 'Non specificato',
          propertySize: size,
          notes: notes || '',
          valuationId: deal.id
        });
      }
    } else {
      // Lead generico (buyer, renter, landlord) - notifiche generiche
      // Notifica al cliente (se ha un account)
      if (clientUser) {
        await notifyLeadCreated({
          clientUserId: clientUser.id,
          clientName,
          clientEmail,
          leadType: type,
          propertyType: propertyType || null,
          budget: budgetMax || budgetMin || null,
          location: location || null
        });
      }

      // Notifica all'agente
      if (agent && agent.user) {
        await notifyAgentNewLead({
          agentUserId: agent.user.id,
          agentName: `${agent.firstName} ${agent.lastName}`,
          agentEmail: agent.email,
          clientName,
          clientEmail,
          clientPhone,
          leadType: type,
          propertyType: propertyType || null,
          budget: budgetMax || budgetMin || null,
          location: location || null
        });
      }
    }

    res.json({
      success: true,
      client,
      deal,
      message: 'Lead creato con successo. Notifiche inviate. L\'agente ti contatterà entro 24 ore.'
    });

  } catch (error) {
    console.error('Errore creazione lead AI:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/ai-crm/calculate-mortgage - Calcola mutuo
// ============================================
router.post('/calculate-mortgage', async (req, res) => {
  try {
    const { amount, years, rate } = req.body;

    if (!amount || !years || !rate) {
      return res.status(400).json({
        success: false,
        error: 'Parametri mancanti: amount, years, rate sono obbligatori'
      });
    }

    // Formula mutuo: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyRate = (rate / 100) / 12;
    const numberOfPayments = years * 12;

    const monthlyPayment = amount *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalAmount = monthlyPayment * numberOfPayments;
    const totalInterest = totalAmount - amount;

    res.json({
      success: true,
      calculation: {
        loanAmount: amount,
        years,
        annualRate: rate,
        monthlyRate: (monthlyRate * 100).toFixed(3),
        monthlyPayment: Math.round(monthlyPayment),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
        numberOfPayments
      },
      message: `Per un mutuo di €${amount.toLocaleString()} a ${years} anni con tasso ${rate}%, la rata mensile sarà di €${Math.round(monthlyPayment).toLocaleString()}`
    });

  } catch (error) {
    console.error('Errore calcolo mutuo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/ai-crm/match-agency - Trova agenzia più adatta
// ============================================
router.post('/match-agency', async (req, res) => {
  try {
    const {
      city,
      propertyType,
      budgetMin,
      budgetMax,
      clientType // buyer, seller, renter
    } = req.body;

    // Trova agenzie nella città
    let whereClause = { status: 'approved' };
    if (city) {
      whereClause.city = { [Op.iLike]: `%${city}%` };
    }

    const partners = await Partner.findAll({
      where: whereClause,
      include: [
        {
          model: Agent,
          as: 'agents',
          where: { status: 'active' },
          required: false
        },
        {
          model: Property,
          as: 'properties',
          where: {
            status: 'available',
            ...(propertyType && { propertyType }),
            ...(budgetMin && { price: { [Op.gte]: budgetMin } }),
            ...(budgetMax && { price: { [Op.lte]: budgetMax } })
          },
          required: false,
          limit: 10
        }
      ]
    });

    if (partners.length === 0) {
      return res.json({
        success: true,
        matches: [],
        message: 'Nessuna agenzia trovata con questi criteri. Prova ad ampliare la ricerca.'
      });
    }

    // Scoring agenzie
    const scoredPartners = partners.map(partner => {
      let score = 0;

      // +20 punti per ogni immobile compatibile
      score += (partner.properties?.length || 0) * 20;

      // +10 punti per ogni agente attivo
      score += (partner.agents?.length || 0) * 10;

      // +30 punti se città corrisponde esattamente
      if (city && partner.city?.toLowerCase() === city.toLowerCase()) {
        score += 30;
      }

      return {
        partnerId: partner.id,
        partnerName: partner.companyName,
        city: partner.city,
        phone: partner.phone,
        email: partner.email,
        website: partner.website,
        agentsCount: partner.agents?.length || 0,
        matchingPropertiesCount: partner.properties?.length || 0,
        score,
        topAgent: partner.agents?.[0] ? {
          id: partner.agents[0].id,
          name: `${partner.agents[0].firstName} ${partner.agents[0].lastName}`,
          email: partner.agents[0].email,
          phone: partner.agents[0].phone
        } : null
      };
    });

    // Ordina per score
    scoredPartners.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      matches: scoredPartners.slice(0, 5), // Top 5
      message: `Trovate ${scoredPartners.length} agenzie. Ti consiglio ${scoredPartners[0].partnerName} con ${scoredPartners[0].matchingPropertiesCount} immobili compatibili.`
    });

  } catch (error) {
    console.error('Errore matching agenzia:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
