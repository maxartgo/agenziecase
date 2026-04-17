import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Partner, Agent } from '../../models/index.js';
import { authenticateToken } from '../../middleware/auth.js';
import { notifyAgentWelcome } from '../../services/notificationService.js';

const router = express.Router();

/**
 * POST /api/auth/register-agent
 * Registrazione di un nuovo agente (solo per Partner)
 */
router.post('/register-agent', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, position, partnerId } = req.body;

    // Verifica che l'utente loggato sia un Partner
    if (req.user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        error: 'Solo i Partner possono registrare agenti'
      });
    }

    // Verifica che tutti i campi obbligatori siano presenti
    if (!firstName || !lastName || !email || !password || !phone || !partnerId) {
      return res.status(400).json({
        success: false,
        error: 'Tutti i campi obbligatori devono essere compilati'
      });
    }

    // Verifica che la password sia di almeno 6 caratteri
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La password deve essere di almeno 6 caratteri'
      });
    }

    // Verifica che l'email non sia già registrata
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email già registrata'
      });
    }

    // Verifica che il Partner esista
    const partner = await Partner.findByPk(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner non trovato'
      });
    }

    // Verifica che il Partner loggato sia lo stesso che sta registrando l'agente
    // (previene che un Partner registri agenti per un altro Partner)
    const loggedUserPartner = await Partner.findOne({ where: { userId: req.user.id } });
    if (!loggedUserPartner || loggedUserPartner.id !== parseInt(partnerId)) {
      return res.status(403).json({
        success: false,
        error: 'Non puoi registrare agenti per un altro Partner'
      });
    }

    // CONTROLLO LIMITE ABBONAMENTO CRM
    // Verifica che il Partner abbia un abbonamento CRM attivo
    if (!loggedUserPartner.crmSubscriptionActive) {
      return res.status(403).json({
        success: false,
        error: 'Abbonamento CRM non attivo. Attiva un abbonamento per registrare agenti.'
      });
    }

    // Verifica che l'abbonamento non sia scaduto
    if (loggedUserPartner.crmSubscriptionEnd && new Date(loggedUserPartner.crmSubscriptionEnd) < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Abbonamento CRM scaduto. Rinnova il tuo abbonamento per continuare.'
      });
    }

    // Conta quanti agenti ha già registrato il Partner (+ se stesso = team size)
    const currentAgentsCount = await Agent.count({
      where: { partnerId: parseInt(partnerId) }
    });

    // Il team size include il partner stesso, quindi posso registrare (teamSize - 1) agenti
    const maxAgents = loggedUserPartner.crmTeamSize - 1;

    if (currentAgentsCount >= maxAgents) {
      return res.status(403).json({
        success: false,
        error: `Limite agenti raggiunto. Il tuo piano ${loggedUserPartner.crmSubscriptionPlan} consente ${loggedUserPartner.crmTeamSize} ${loggedUserPartner.crmTeamSize === 1 ? 'persona' : 'persone'} (te incluso), quindi puoi registrare massimo ${maxAgents} ${maxAgents === 1 ? 'agente' : 'agenti'}. Hai già ${currentAgentsCount} ${currentAgentsCount === 1 ? 'agente registrato' : 'agenti registrati'}. Passa a un piano superiore per aggiungere più agenti.`
      });
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea il nuovo User per l'agente
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'agent'
    });

    // Crea il profilo Agent collegato al User
    const newAgent = await Agent.create({
      userId: newUser.id,
      partnerId: parseInt(partnerId),
      phone,
      position: position || 'Agente Immobiliare'
    });

    // Recupera l'agente con le relazioni
    const agentWithRelations = await Agent.findByPk(newAgent.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        },
        {
          model: Partner,
          as: 'agency',
          attributes: ['id', 'agencyName', 'email']
        }
      ]
    });

    console.log('✅ Nuovo agente registrato:', email);

    // Invia notifica di benvenuto al nuovo agente
    await notifyAgentWelcome({
      userId: newUser.id,
      agentName: `${firstName} ${lastName}`,
      agentEmail: email,
      agencyName: agentWithRelations.agency?.agencyName || 'Agenzia',
      position: position || 'Agente Immobiliare'
    });

    res.status(201).json({
      success: true,
      message: 'Agente registrato con successo',
      agent: agentWithRelations
    });
  } catch (error) {
    console.error('❌ Errore registrazione agente:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la registrazione dell\'agente'
    });
  }
});

export default router;
