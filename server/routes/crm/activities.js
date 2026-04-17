import express from 'express';
import { Activity, Client, Agent, Deal, Property, Appointment } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';

const router = express.Router();

// ============================================
// GET /api/crm/activities - Lista attività
// ============================================
router.get('/', async (req, res) => {
  try {
    const {
      partnerId,
      agentId,
      clientId,
      dealId,
      propertyId,
      appointmentId,
      type,
      outcome,
      isCompleted,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = req.query;

    // Costruisci filtri dinamici
    const where = {};

    if (partnerId) where.partnerId = partnerId;
    if (agentId) where.agentId = agentId;
    if (clientId) where.clientId = clientId;
    if (dealId) where.dealId = dealId;
    if (propertyId) where.propertyId = propertyId;
    if (appointmentId) where.appointmentId = appointmentId;
    if (type) where.type = type;
    if (outcome) where.outcome = outcome;
    if (isCompleted !== undefined) where.isCompleted = isCompleted === 'true';

    // Filtro per range di date
    if (startDate || endDate) {
      where.activityDate = {};
      if (startDate) where.activityDate[Op.gte] = new Date(startDate);
      if (endDate) where.activityDate[Op.lte] = new Date(endDate);
    }

    const activities = await Activity.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Deal,
          as: 'deal',
          attributes: ['id', 'title', 'stage']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'title', 'startDate']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['activityDate', 'DESC']]
    });

    res.json({
      success: true,
      activities: activities.rows,
      total: activities.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Errore recupero attività:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/activities/:id - Dettaglio attività
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          as: 'client'
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Deal,
          as: 'deal'
        },
        {
          model: Property,
          as: 'property'
        },
        {
          model: Appointment,
          as: 'appointment'
        }
      ]
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Attività non trovata'
      });
    }

    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Errore recupero attività:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/crm/activities - Crea nuova attività
// ============================================
router.post('/', async (req, res) => {
  try {
    const activityData = req.body;

    // Validazione base
    if (!activityData.type || !activityData.agentId || !activityData.partnerId) {
      return res.status(400).json({
        success: false,
        error: 'Tipo, agentId e partnerId sono obbligatori'
      });
    }

    // Se è un task e non ha activityDate, usa la data corrente
    if (!activityData.activityDate) {
      activityData.activityDate = new Date();
    }

    const activity = await Activity.create(activityData);

    res.status(201).json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Errore creazione attività:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// PUT /api/crm/activities/:id - Aggiorna attività
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Attività non trovata'
      });
    }

    // Se il task viene completato, imposta completedAt
    if (req.body.isCompleted === true && !activity.isCompleted) {
      req.body.completedAt = new Date();
    }

    await activity.update(req.body);

    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Errore aggiornamento attività:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DELETE /api/crm/activities/:id - Elimina attività
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Attività non trovata'
      });
    }

    await activity.destroy();

    res.json({
      success: true,
      message: 'Attività eliminata con successo'
    });
  } catch (error) {
    console.error('Errore eliminazione attività:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/activities/timeline/:partnerId - Timeline attività
// ============================================
router.get('/timeline/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { agentId, clientId, dealId, days = 30 } = req.query;

    const where = { partnerId };
    if (agentId) where.agentId = agentId;
    if (clientId) where.clientId = clientId;
    if (dealId) where.dealId = dealId;

    // Filtra per gli ultimi X giorni
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    where.activityDate = { [Op.gte]: daysAgo };

    const activities = await Activity.findAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Deal,
          as: 'deal',
          attributes: ['id', 'title']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title']
        }
      ],
      order: [['activityDate', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Errore timeline attività:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/activities/tasks/:partnerId - Tasks da completare
// ============================================
router.get('/tasks/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { agentId, overdueOnly } = req.query;

    const where = {
      partnerId,
      type: 'task',
      isCompleted: false
    };

    if (agentId) where.agentId = agentId;

    // Solo tasks scaduti
    if (overdueOnly === 'true') {
      where.followUpDate = { [Op.lt]: new Date() };
    }

    const tasks = await Activity.findAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Deal,
          as: 'deal',
          attributes: ['id', 'title', 'stage']
        }
      ],
      order: [['followUpDate', 'ASC']]
    });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Errore recupero tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/activities/stats/:partnerId - Statistiche attività
// ============================================
router.get('/stats/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;

    // Totale attività
    const total = await Activity.count({ where: { partnerId } });

    // Attività per tipo
    const byType = await Activity.findAll({
      where: { partnerId },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    // Attività per outcome
    const byOutcome = await Activity.findAll({
      where: {
        partnerId,
        outcome: { [Op.ne]: null }
      },
      attributes: [
        'outcome',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['outcome'],
      raw: true
    });

    // Tasks aperti
    const openTasks = await Activity.count({
      where: {
        partnerId,
        type: 'task',
        isCompleted: false
      }
    });

    // Tasks scaduti
    const overdueTasks = await Activity.count({
      where: {
        partnerId,
        type: 'task',
        isCompleted: false,
        followUpDate: { [Op.lt]: new Date() }
      }
    });

    // Attività oggi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await Activity.count({
      where: {
        partnerId,
        activityDate: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    // Attività questa settimana
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const thisWeekCount = await Activity.count({
      where: {
        partnerId,
        activityDate: {
          [Op.gte]: startOfWeek,
          [Op.lt]: endOfWeek
        }
      }
    });

    // Durata media chiamate (in minuti)
    const avgCallDuration = await Activity.findOne({
      where: {
        partnerId,
        type: 'call',
        duration: { [Op.ne]: null }
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('duration')), 'avgDuration']
      ],
      raw: true
    });

    res.json({
      success: true,
      stats: {
        total,
        today: todayCount,
        thisWeek: thisWeekCount,
        openTasks,
        overdueTasks,
        avgCallDuration: avgCallDuration?.avgDuration ? Math.round(avgCallDuration.avgDuration) : 0,
        byType,
        byOutcome
      }
    });
  } catch (error) {
    console.error('Errore statistiche attività:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
