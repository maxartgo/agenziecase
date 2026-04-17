import express from 'express';
import sequelize from '../../config/database.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/support-tickets
 * Ottieni tutti i ticket (solo Admin)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Verifica che l'utente sia Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accesso negato. Solo gli admin possono accedere a questa risorsa.'
      });
    }

    const { status, priority } = req.query;

    let whereClause = '';
    const replacements = {};

    if (status) {
      whereClause += ' AND t.status = :status';
      replacements.status = status;
    }

    if (priority) {
      whereClause += ' AND t.priority = :priority';
      replacements.priority = priority;
    }

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
        ) as responses_count,
        (
          SELECT COUNT(*)
          FROM support_ticket_responses r
          WHERE r.ticket_id = t.id AND r.is_admin_response = false
        ) as user_responses_count
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE 1=1 ${whereClause}
      ORDER BY
        CASE
          WHEN t.status = 'open' THEN 1
          WHEN t.status = 'in_progress' THEN 2
          WHEN t.status = 'waiting_response' THEN 3
          ELSE 4
        END,
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
        END,
        t.created_at DESC
    `, {
      replacements
    });

    res.json({
      success: true,
      tickets
    });

  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero dei ticket'
    });
  }
});

/**
 * GET /api/admin/support-tickets/stats
 * Ottieni statistiche ticket (solo Admin)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accesso negato'
      });
    }

    const [stats] = await sequelize.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'waiting_response' THEN 1 END) as waiting_response,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high
      FROM support_tickets
    `);

    res.json({
      success: true,
      stats: stats[0]
    });

  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle statistiche'
    });
  }
});

/**
 * PATCH /api/admin/support-tickets/:ticketId/assign
 * Assegna ticket a un admin (solo Admin)
 */
router.patch('/:ticketId/assign', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accesso negato'
      });
    }

    const { ticketId } = req.params;
    const { assignedTo } = req.body;

    await sequelize.query(`
      UPDATE support_tickets
      SET
        assigned_to = :assignedTo,
        status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END,
        updated_at = NOW()
      WHERE id = :ticketId
    `, {
      replacements: { ticketId, assignedTo }
    });

    res.json({
      success: true,
      message: 'Ticket assegnato con successo'
    });

  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'assegnazione del ticket'
    });
  }
});

/**
 * PATCH /api/admin/support-tickets/:ticketId/priority
 * Cambia priorità del ticket (solo Admin)
 */
router.patch('/:ticketId/priority', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accesso negato'
      });
    }

    const { ticketId } = req.params;
    const { priority } = req.body;

    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priorità non valida'
      });
    }

    await sequelize.query(`
      UPDATE support_tickets
      SET priority = :priority, updated_at = NOW()
      WHERE id = :ticketId
    `, {
      replacements: { ticketId, priority }
    });

    res.json({
      success: true,
      message: 'Priorità aggiornata con successo'
    });

  } catch (error) {
    console.error('Error updating ticket priority:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento della priorità'
    });
  }
});

export default router;
