import express from 'express';
import { Client, Agent, Activity, Appointment, Deal, Document } from '../../models/index.js';
import { Op } from 'sequelize';
import db from '../../config/database.js';
import { cacheMiddleware, cacheTTL, cacheInvalidators } from '../../middleware/cache.js';

const router = express.Router();

// ============================================
// GET /api/crm/clients - Lista clienti
// ============================================
router.get('/', cacheMiddleware(cacheTTL.MEDIUM), async (req, res) => {
router.get('/', async (req, res) => {
  try {
    const {
      partnerId,
      agentId,
      status,
      type,
      priority,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    // Costruisci filtri dinamici
    const where = {};

    if (partnerId) where.partnerId = partnerId;
    if (agentId) where.agentId = agentId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    // Ricerca full-text
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const clients = await Client.findAndCountAll({
      where,
      include: [
        {
          model: Agent,
          as: 'assignedAgent',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      clients: clients.rows,
      total: clients.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Errore recupero clienti:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/clients/:id - Dettaglio cliente
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        {
          model: Agent,
          as: 'assignedAgent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Appointment,
          as: 'appointments',
          limit: 10,
          order: [['startDate', 'DESC']]
        },
        {
          model: Deal,
          as: 'deals',
          limit: 10,
          order: [['createdAt', 'DESC']]
        },
        {
          model: Activity,
          as: 'activities',
          limit: 20,
          order: [['activityDate', 'DESC']]
        },
        {
          model: Document,
          as: 'documents',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente non trovato'
      });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Errore recupero cliente:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/crm/clients - Crea nuovo cliente
// ============================================
router.post('/', async (req, res) => {
  try {
    const clientData = req.body;

    // Validazione base
    if (!clientData.firstName || !clientData.lastName || !clientData.partnerId) {
      return res.status(400).json({
        success: false,
        error: 'Nome, cognome e partnerId sono obbligatori'
      });
    }

    const client = await Client.create(clientData);

    // Crea automaticamente una Activity di creazione
    await Activity.create({
      type: 'note',
      subject: 'Cliente creato',
      content: `Nuovo cliente creato: ${client.firstName} ${client.lastName}`,
      activityDate: new Date(),
      clientId: client.id,
      agentId: clientData.agentId || null,
      partnerId: clientData.partnerId
    });

    // Invalidate cache
    await cacheInvalidators.clients();

    res.status(201).json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Errore creazione cliente:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// PUT /api/crm/clients/:id - Aggiorna cliente
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente non trovato'
      });
    }

    await client.update(req.body);

    // Invalidate cache
    await cacheInvalidators.clients();

    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Errore aggiornamento cliente:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DELETE /api/crm/clients/:id - Elimina cliente
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Cliente non trovato'
      });
    }

    await client.destroy();

    // Invalidate cache
    await cacheInvalidators.clients();

    res.json({
      success: true,
      message: 'Cliente eliminato con successo'
    });
  } catch (error) {
    console.error('Errore eliminazione cliente:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/clients/stats/:partnerId - Statistiche clienti
// ============================================
router.get('/stats/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Single query for all stats using subqueries and CASE
    const [stats, byStatus, byType] = await Promise.all([
      // Get total and this month count in one query
      Client.findOne({
        where: { partnerId },
        attributes: [
          [db.fn('COUNT', db.col('id')), 'total'],
          [
            db.fn('COUNT',
              db.literal(`CASE WHEN "${Client.tableName}"."created_at" >= '${thisMonthStart.toISOString()}' THEN 1 END`)
            ),
            'thisMonth'
          ]
        ],
        raw: true
      }),
      // Count by status
      Client.findAll({
        where: { partnerId },
        attributes: [
          'status',
          [db.fn('COUNT', db.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),
      // Count by type
      Client.findAll({
        where: { partnerId },
        attributes: [
          'type',
          [db.fn('COUNT', db.col('id')), 'count']
        ],
        group: ['type'],
        raw: true
      })
    ]);

    res.json({
      success: true,
      stats: {
        total: parseInt(stats.total) || 0,
        thisMonth: parseInt(stats.thisMonth) || 0,
        byStatus,
        byType
      }
    });
  } catch (error) {
    console.error('Errore statistiche clienti:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
