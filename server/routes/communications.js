import express from 'express';
import {
  generateAppointmentEmail,
  generateLeadEmail,
  generateValuationEmail,
  sendEmail,
  prepareWhatsAppMessage
} from '../utils/communications.js';
import { Client, Agent, Appointment, Property } from '../models/index.js';

const router = express.Router();

// ============================================
// POST /api/communications/send-appointment-confirmation
// ============================================
router.post('/send-appointment-confirmation', async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        error: 'appointmentId è obbligatorio'
      });
    }

    // Recupera appuntamento con relazioni
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Client, as: 'client' },
        { model: Agent, as: 'agent' },
        { model: Property, as: 'property' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appuntamento non trovato'
      });
    }

    const client = appointment.client;
    const agent = appointment.agent;
    const property = appointment.property;

    // Genera email
    const emailTemplate = generateAppointmentEmail(appointment, client, agent, property);

    // Invia email
    const emailResult = await sendEmail(
      client.email,
      emailTemplate.subject,
      emailTemplate.body
    );

    // Genera link WhatsApp
    const whatsappData = prepareWhatsAppMessage(
      client.phone,
      'appointment',
      { appointment, client, agent, property }
    );

    res.json({
      success: true,
      message: 'Comunicazioni preparate con successo',
      email: emailResult,
      whatsapp: whatsappData
    });

  } catch (error) {
    console.error('Errore invio conferma appuntamento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/communications/send-lead-confirmation
// ============================================
router.post('/send-lead-confirmation', async (req, res) => {
  try {
    const { clientId, dealId } = req.body;

    if (!clientId || !dealId) {
      return res.status(400).json({
        success: false,
        error: 'clientId e dealId sono obbligatori'
      });
    }

    // Recupera dati
    const client = await Client.findByPk(clientId, {
      include: [{ model: Agent, as: 'assignedAgent' }]
    });

    const Deal = (await import('../models/index.js')).Deal;
    const lead = await Deal.findByPk(dealId);

    if (!client || !lead) {
      return res.status(404).json({
        success: false,
        error: 'Cliente o lead non trovato'
      });
    }

    const agent = client.assignedAgent;

    // Genera email
    const emailTemplate = generateLeadEmail(lead, client, agent);

    // Invia email
    const emailResult = await sendEmail(
      client.email,
      emailTemplate.subject,
      emailTemplate.body
    );

    // Genera link WhatsApp
    const whatsappData = prepareWhatsAppMessage(
      client.phone,
      'lead',
      { client, agent }
    );

    res.json({
      success: true,
      message: 'Comunicazioni preparate con successo',
      email: emailResult,
      whatsapp: whatsappData
    });

  } catch (error) {
    console.error('Errore invio conferma lead:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/communications/send-valuation-request
// ============================================
router.post('/send-valuation-request', async (req, res) => {
  try {
    const { clientId, agentId, propertyDetails } = req.body;

    if (!clientId || !agentId || !propertyDetails) {
      return res.status(400).json({
        success: false,
        error: 'clientId, agentId e propertyDetails sono obbligatori'
      });
    }

    const client = await Client.findByPk(clientId);
    const agent = await Agent.findByPk(agentId);

    if (!client || !agent) {
      return res.status(404).json({
        success: false,
        error: 'Cliente o agente non trovato'
      });
    }

    // Genera email
    const emailTemplate = generateValuationEmail(client, agent, propertyDetails);

    // Invia email
    const emailResult = await sendEmail(
      client.email,
      emailTemplate.subject,
      emailTemplate.body
    );

    res.json({
      success: true,
      message: 'Email di valutazione inviata con successo',
      email: emailResult
    });

  } catch (error) {
    console.error('Errore invio richiesta valutazione:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/communications/generate-whatsapp-link
// ============================================
router.post('/generate-whatsapp-link', async (req, res) => {
  try {
    const { phoneNumber, messageType, data } = req.body;

    if (!phoneNumber || !messageType) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber e messageType sono obbligatori'
      });
    }

    const whatsappData = prepareWhatsAppMessage(phoneNumber, messageType, data);

    res.json({
      success: true,
      whatsapp: whatsappData
    });

  } catch (error) {
    console.error('Errore generazione link WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
