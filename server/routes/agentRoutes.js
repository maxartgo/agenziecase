import express from 'express';
import { User, Partner, Agent } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/agents
 * Ottiene la lista degli agenti del Partner loggato
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Verifica che l'utente loggato sia un Partner
    if (req.user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        error: 'Solo i Partner possono accedere a questa risorsa'
      });
    }

    // Trova il Partner loggato
    const partner = await Partner.findOne({ where: { userId: req.user.id } });
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner non trovato'
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Trova tutti gli agenti del Partner con paginazione
    const { count, rows } = await Agent.findAndCountAll({
      where: { partnerId: partner.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      agents: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('❌ Errore caricamento agenti:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il caricamento degli agenti'
    });
  }
});

/**
 * GET /api/agents/:id
 * Ottiene i dettagli di un agente specifico
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica che l'utente loggato sia un Partner
    if (req.user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        error: 'Solo i Partner possono accedere a questa risorsa'
      });
    }

    // Trova il Partner loggato
    const partner = await Partner.findOne({ where: { userId: req.user.id } });
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner non trovato'
      });
    }

    // Trova l'agente e verifica che appartenga al Partner
    const agent = await Agent.findOne({
      where: {
        id: parseInt(id),
        partnerId: partner.id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt']
        },
        {
          model: Partner,
          as: 'agency',
          attributes: ['id', 'agencyName', 'email']
        }
      ]
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agente non trovato'
      });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('❌ Errore caricamento agente:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il caricamento dell\'agente'
    });
  }
});

export default router;
