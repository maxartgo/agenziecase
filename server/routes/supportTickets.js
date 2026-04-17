import express from 'express';
import sequelize from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  notifyTicketCreated,
  notifyTicketReplied,
  notifyTicketResolved
} from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/support-tickets
 * Ottieni tutti i ticket dell'utente loggato
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [tickets] = await sequelize.query(`
      SELECT
        t.*,
        u."firstName" || ' ' || u."lastName" as author_name,
        u.email as author_email,
        u.role as author_role,
        a."firstName" || ' ' || a."lastName" as assigned_to_name,
        (
          SELECT COUNT(*)
          FROM support_ticket_responses r
          WHERE r.ticket_id = t.id
        ) as responses_count
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.user_id = :userId
      ORDER BY t.created_at DESC
    `, {
      replacements: { userId }
    });

    res.json({
      success: true,
      tickets
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero dei ticket'
    });
  }
});

/**
 * GET /api/support-tickets/:ticketId
 * Ottieni dettaglio ticket con risposte
 */
router.get('/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    // Verifica che il ticket appartenga all'utente (o sia admin)
    const [tickets] = await sequelize.query(`
      SELECT
        t.*,
        u."firstName" || ' ' || u."lastName" as author_name,
        u.email as author_email,
        u.role as author_role
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = :ticketId
        AND (t.user_id = :userId OR :isAdmin = true)
    `, {
      replacements: {
        ticketId,
        userId,
        isAdmin: req.user.role === 'admin'
      }
    });

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trovato'
      });
    }

    // Carica le risposte
    const [responses] = await sequelize.query(`
      SELECT
        r.*,
        u."firstName" || ' ' || u."lastName" as author_name,
        u.email as author_email,
        u.role as author_role
      FROM support_ticket_responses r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.ticket_id = :ticketId
      ORDER BY r.created_at ASC
    `, {
      replacements: { ticketId }
    });

    res.json({
      success: true,
      ticket: tickets[0],
      responses
    });

  } catch (error) {
    console.error('Error fetching ticket detail:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero del ticket'
    });
  }
});

/**
 * POST /api/support-tickets
 * Crea nuovo ticket di supporto
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, message, category, priority = 'normal' } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject e message sono obbligatori'
      });
    }

    // Genera ticket number
    const [result] = await sequelize.query(`
      INSERT INTO support_tickets (
        ticket_number,
        subject,
        message,
        status,
        priority,
        category,
        user_id,
        created_at,
        updated_at
      ) VALUES (
        generate_ticket_number(),
        :subject,
        :message,
        'open',
        :priority,
        :category,
        :userId,
        NOW(),
        NOW()
      )
      RETURNING *
    `, {
      replacements: {
        subject,
        message,
        priority,
        category,
        userId
      }
    });

    const newTicket = result[0];

    console.log('✅ Nuovo ticket creato:', newTicket.ticket_number);

    // Carica i dati utente per notifica
    const [userData] = await sequelize.query(`
      SELECT id, "firstName", "lastName", email
      FROM users
      WHERE id = :userId
    `, {
      replacements: { userId }
    });

    if (userData.length > 0) {
      const user = userData[0];
      await notifyTicketCreated({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        ticketNumber: newTicket.ticket_number,
        subject: newTicket.subject,
        message: newTicket.message,
        category: newTicket.category || 'Generale',
        priority: newTicket.priority,
        ticketId: newTicket.id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ticket creato con successo',
      ticket: newTicket
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la creazione del ticket'
    });
  }
});

/**
 * POST /api/support-tickets/:ticketId/responses
 * Aggiungi risposta a un ticket
 */
router.post('/:ticketId/responses', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message è obbligatorio'
      });
    }

    // Verifica che il ticket esista e l'utente abbia accesso
    const [tickets] = await sequelize.query(`
      SELECT * FROM support_tickets
      WHERE id = :ticketId
        AND (user_id = :userId OR :isAdmin = true)
    `, {
      replacements: {
        ticketId,
        userId,
        isAdmin: req.user.role === 'admin'
      }
    });

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trovato'
      });
    }

    // Aggiungi risposta
    const [result] = await sequelize.query(`
      INSERT INTO support_ticket_responses (
        ticket_id,
        user_id,
        message,
        is_admin_response,
        created_at,
        updated_at
      ) VALUES (
        :ticketId,
        :userId,
        :message,
        :isAdminResponse,
        NOW(),
        NOW()
      )
      RETURNING *
    `, {
      replacements: {
        ticketId,
        userId,
        message,
        isAdminResponse: req.user.role === 'admin'
      }
    });

    // Aggiorna status del ticket se era closed
    if (tickets[0].status === 'closed') {
      await sequelize.query(`
        UPDATE support_tickets
        SET status = 'in_progress', updated_at = NOW()
        WHERE id = :ticketId
      `, {
        replacements: { ticketId }
      });
    }

    // Invia notifica se un admin ha risposto al ticket
    const isAdminResponse = req.user.role === 'admin';
    if (isAdminResponse) {
      // Carica dati del proprietario del ticket
      const [ticketOwnerData] = await sequelize.query(`
        SELECT u.id, u."firstName", u."lastName", u.email
        FROM users u
        WHERE u.id = :ticketOwnerId
      `, {
        replacements: { ticketOwnerId: tickets[0].user_id }
      });

      if (ticketOwnerData.length > 0) {
        const ticketOwner = ticketOwnerData[0];
        await notifyTicketReplied({
          userId: ticketOwner.id,
          userName: `${ticketOwner.firstName} ${ticketOwner.lastName}`,
          userEmail: ticketOwner.email,
          ticketNumber: tickets[0].ticket_number,
          ticketSubject: tickets[0].subject,
          replyMessage: message,
          ticketId: tickets[0].id
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Risposta aggiunta con successo',
      response: result[0]
    });

  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiunta della risposta'
    });
  }
});

/**
 * PATCH /api/support-tickets/:ticketId/status
 * Aggiorna status del ticket
 */
router.patch('/:ticketId/status', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['open', 'in_progress', 'waiting_response', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status non valido'
      });
    }

    // Solo admin o owner possono cambiare status
    const [tickets] = await sequelize.query(`
      SELECT * FROM support_tickets
      WHERE id = :ticketId
        AND (user_id = :userId OR :isAdmin = true)
    `, {
      replacements: {
        ticketId,
        userId,
        isAdmin: req.user.role === 'admin'
      }
    });

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trovato'
      });
    }

    await sequelize.query(`
      UPDATE support_tickets
      SET
        status = :status,
        closed_at = CASE WHEN :status = 'closed' THEN NOW() ELSE closed_at END,
        updated_at = NOW()
      WHERE id = :ticketId
    `, {
      replacements: { ticketId, status }
    });

    // Invia notifica se il ticket è stato chiuso/risolto
    if (status === 'closed') {
      // Carica dati del proprietario del ticket
      const [ticketOwnerData] = await sequelize.query(`
        SELECT u.id, u."firstName", u."lastName", u.email
        FROM users u
        WHERE u.id = :ticketOwnerId
      `, {
        replacements: { ticketOwnerId: tickets[0].user_id }
      });

      if (ticketOwnerData.length > 0) {
        const ticketOwner = ticketOwnerData[0];
        await notifyTicketResolved({
          userId: ticketOwner.id,
          userName: `${ticketOwner.firstName} ${ticketOwner.lastName}`,
          userEmail: ticketOwner.email,
          ticketNumber: tickets[0].ticket_number,
          ticketSubject: tickets[0].subject,
          resolutionDate: new Date().toISOString(),
          ticketId: tickets[0].id
        });
      }
    }

    res.json({
      success: true,
      message: 'Status aggiornato con successo'
    });

  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento dello status'
    });
  }
});

export default router;
