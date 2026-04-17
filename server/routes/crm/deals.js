import express from 'express';
import { Deal, Client, Agent, Property, Activity, Document } from '../../models/index.js';
import { Op } from 'sequelize';
import db from '../../config/database.js';
import { cacheMiddleware, cacheTTL, cacheInvalidators } from '../../middleware/cache.js';

const router = express.Router();

// ============================================
// GET /api/crm/deals - Lista trattative
// ============================================
router.get('/', cacheMiddleware(cacheTTL.MEDIUM), async (req, res) => {
  try {
    const {
      partnerId,
      agentId,
      clientId,
      propertyId,
      stage,
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
    if (clientId) where.clientId = clientId;
    if (propertyId) where.propertyId = propertyId;
    if (stage) where.stage = stage;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    // Ricerca per titolo
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const deals = await Deal.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address', 'city', 'price', 'type']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      deals: deals.rows,
      total: deals.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Errore recupero trattative:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/deals/:id - Dettaglio trattativa
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id, {
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
          model: Property,
          as: 'property'
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

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Trattativa non trovata'
      });
    }

    res.json({
      success: true,
      deal
    });
  } catch (error) {
    console.error('Errore recupero trattativa:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/crm/deals - Crea nuova trattativa
// ============================================
router.post('/', async (req, res) => {
  try {
    const dealData = req.body;

    // Validazione base
    if (!dealData.title || !dealData.type || !dealData.clientId ||
        !dealData.agentId || !dealData.partnerId) {
      return res.status(400).json({
        success: false,
        error: 'Titolo, tipo, clientId, agentId e partnerId sono obbligatori'
      });
    }

    const deal = await Deal.create(dealData);

    // Crea automaticamente una Activity
    await Activity.create({
      type: 'note',
      subject: 'Trattativa creata',
      content: `Nuova trattativa creata: ${deal.title} - Stadio: ${deal.stage}`,
      activityDate: new Date(),
      clientId: dealData.clientId,
      propertyId: dealData.propertyId || null,
      dealId: deal.id,
      agentId: dealData.agentId,
      partnerId: dealData.partnerId
    });

    // Invalidate cache
    await cacheInvalidators.deals();

    res.status(201).json({
      success: true,
      deal
    });
  } catch (error) {
    console.error('Errore creazione trattativa:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// PUT /api/crm/deals/:id - Aggiorna trattativa
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Trattativa non trovata'
      });
    }

    // Salva lo stadio precedente per il log
    const previousStage = deal.stage;

    await deal.update(req.body);

    // Se lo stadio è cambiato, crea un'attività di log
    if (req.body.stage && req.body.stage !== previousStage) {
      let activityContent = `Stadio trattativa cambiato da ${previousStage} a ${req.body.stage}`;

      // Se è diventata won o lost, aggiungi info extra
      if (req.body.stage === 'won') {
        activityContent += ` - Trattativa vinta! Valore: €${deal.value}`;
      } else if (req.body.stage === 'lost' && req.body.lostReason) {
        activityContent += ` - Motivo: ${req.body.lostReason}`;
      }

      await Activity.create({
        type: 'note',
        subject: `Trattativa ${req.body.stage}`,
        content: activityContent,
        activityDate: new Date(),
        clientId: deal.clientId,
        propertyId: deal.propertyId,
        dealId: deal.id,
        agentId: deal.agentId,
        partnerId: deal.partnerId
      });
    }

    // Invalidate cache
    await cacheInvalidators.deals();

    res.json({
      success: true,
      deal
    });
  } catch (error) {
    console.error('Errore aggiornamento trattativa:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DELETE /api/crm/deals/:id - Elimina trattativa
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Trattativa non trovata'
      });
    }

    await deal.destroy();

    // Invalidate cache
    await cacheInvalidators.deals();

    res.json({
      success: true,
      message: 'Trattativa eliminata con successo'
    });
  } catch (error) {
    console.error('Errore eliminazione trattativa:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/deals/pipeline/:partnerId - Sales Pipeline
// ============================================
router.get('/pipeline/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { agentId } = req.query;

    const where = { partnerId };
    if (agentId) where.agentId = agentId;

    // Raggruppa per stadio
    const pipeline = await Deal.findAll({
      where,
      attributes: [
        'stage',
        [db.fn('COUNT', db.col('id')), 'count'],
        [db.fn('SUM', db.col('value')), 'totalValue'],
        [db.fn('AVG', db.col('probability')), 'avgProbability']
      ],
      group: ['stage'],
      raw: true
    });

    res.json({
      success: true,
      pipeline
    });
  } catch (error) {
    console.error('Errore pipeline:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/deals/stats/:partnerId - Statistiche trattative
// ============================================
router.get('/stats/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Run all queries in parallel for better performance
    const [summaryStats, byType, lostReasons] = await Promise.all([
      // Get all summary stats in a single aggregation query
      Deal.findOne({
        where: { partnerId },
        attributes: [
          [db.fn('COUNT', db.col('id')), 'total'],
          [db.fn('COUNT', db.literal(`CASE WHEN stage = 'won' THEN 1 END`)), 'won'],
          [db.fn('COUNT', db.literal(`CASE WHEN stage = 'lost' THEN 1 END`)), 'lost'],
          [db.fn('COUNT', db.literal(`CASE WHEN stage NOT IN ('won', 'lost') THEN 1 END`)), 'active'],
          [db.fn('SUM', db.literal(`CASE WHEN stage NOT IN ('won', 'lost') THEN value ELSE 0 END`)), 'activeValue'],
          [db.fn('SUM', db.literal(`CASE WHEN stage = 'won' THEN value ELSE 0 END`)), 'wonValue'],
          [db.fn('SUM', db.literal(`CASE WHEN stage = 'won' THEN "expectedCommission" ELSE 0 END`)), 'totalCommission'],
          [
            db.fn('COUNT',
              db.literal(`CASE WHEN stage IN ('won', 'lost') AND "actualCloseDate" >= '${thisMonthStart.toISOString()}' THEN 1 END`)
            ),
            'thisMonthClosed'
          ]
        ],
        raw: true
      }),
      // Group by type
      Deal.findAll({
        where: { partnerId },
        attributes: [
          'type',
          [db.fn('COUNT', db.col('id')), 'count']
        ],
        group: ['type'],
        raw: true
      }),
      // Lost reasons
      Deal.findAll({
        where: { partnerId, stage: 'lost' },
        attributes: [
          'lostReason',
          [db.fn('COUNT', db.col('id')), 'count']
        ],
        group: ['lostReason'],
        order: [[db.fn('COUNT', db.col('id')), 'DESC']],
        limit: 5,
        raw: true
      })
    ]);

    const total = parseInt(summaryStats.total) || 0;
    const won = parseInt(summaryStats.won) || 0;
    const conversionRate = total > 0 ? ((won / total) * 100).toFixed(2) : '0.00';

    res.json({
      success: true,
      stats: {
        total,
        active: parseInt(summaryStats.active) || 0,
        won,
        lost: parseInt(summaryStats.lost) || 0,
        conversionRate: parseFloat(conversionRate),
        activeValue: parseFloat(summaryStats.activeValue) || 0,
        wonValue: parseFloat(summaryStats.wonValue) || 0,
        totalCommission: parseFloat(summaryStats.totalCommission) || 0,
        thisMonthClosed: parseInt(summaryStats.thisMonthClosed) || 0,
        byType,
        lostReasons
      }
    });
  } catch (error) {
    console.error('Errore statistiche trattative:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
