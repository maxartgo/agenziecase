import express from 'express';
import { Appointment, Client, Agent, Property, Activity, User } from '../../models/index.js';
import { Op } from 'sequelize';
import {
  notifyAppointmentUpdated,
  notifyAppointmentCancelled
} from '../../services/notificationService.js';

const router = express.Router();

// ============================================
// GET /api/crm/appointments - Lista appuntamenti
// ============================================
router.get('/', async (req, res) => {
  try {
    const {
      partnerId,
      agentId,
      clientId,
      propertyId,
      status,
      type,
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
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (type) where.type = type;

    // Filtro per range di date
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate[Op.gte] = new Date(startDate);
      if (endDate) where.startDate[Op.lte] = new Date(endDate);
    }

    const appointments = await Appointment.findAndCountAll({
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
      order: [['startDate', 'ASC']]
    });

    res.json({
      success: true,
      appointments: appointments.rows,
      total: appointments.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Errore recupero appuntamenti:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/appointments/:id - Dettaglio appuntamento
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'type']
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
          limit: 10,
          order: [['activityDate', 'DESC']]
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appuntamento non trovato'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Errore recupero appuntamento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/crm/appointments - Crea nuovo appuntamento
// ============================================
router.post('/', async (req, res) => {
  try {
    const appointmentData = req.body;

    // Validazione base
    if (!appointmentData.title || !appointmentData.startDate || !appointmentData.endDate ||
        !appointmentData.clientId || !appointmentData.agentId || !appointmentData.partnerId) {
      return res.status(400).json({
        success: false,
        error: 'Titolo, date, clientId, agentId e partnerId sono obbligatori'
      });
    }

    // Verifica che startDate sia prima di endDate
    if (new Date(appointmentData.startDate) >= new Date(appointmentData.endDate)) {
      return res.status(400).json({
        success: false,
        error: 'La data di inizio deve essere precedente alla data di fine'
      });
    }

    const appointment = await Appointment.create(appointmentData);

    // Crea automaticamente una Activity
    await Activity.create({
      type: 'note',
      subject: 'Appuntamento creato',
      content: `Nuovo appuntamento: ${appointment.title}`,
      activityDate: new Date(),
      clientId: appointmentData.clientId,
      propertyId: appointmentData.propertyId || null,
      appointmentId: appointment.id,
      agentId: appointmentData.agentId,
      partnerId: appointmentData.partnerId
    });

    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Errore creazione appuntamento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// PUT /api/crm/appointments/:id - Aggiorna appuntamento
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          as: 'client',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Agent,
          as: 'agent',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Property,
          as: 'property'
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appuntamento non trovato'
      });
    }

    // Salva lo stato precedente per il log e notifiche
    const previousStatus = appointment.status;
    const previousStartDate = appointment.startDate;

    await appointment.update(req.body);

    // Se lo stato è cambiato, crea un'attività di log
    if (req.body.status && req.body.status !== previousStatus) {
      await Activity.create({
        type: 'note',
        subject: `Appuntamento ${req.body.status}`,
        content: `Stato appuntamento cambiato da ${previousStatus} a ${req.body.status}`,
        activityDate: new Date(),
        clientId: appointment.clientId,
        propertyId: appointment.propertyId,
        appointmentId: appointment.id,
        agentId: appointment.agentId,
        partnerId: appointment.partnerId
      });
    }

    // Invia notifiche se data/ora o dettagli importanti sono cambiati
    const dateChanged = req.body.startDate && new Date(req.body.startDate).getTime() !== new Date(previousStartDate).getTime();
    const statusChanged = req.body.status && req.body.status !== previousStatus;

    if (dateChanged || statusChanged || req.body.title || req.body.location) {
      // Notifica al cliente
      if (appointment.client && appointment.client.user) {
        await notifyAppointmentUpdated({
          userId: appointment.client.user.id,
          userName: `${appointment.client.firstName} ${appointment.client.lastName}`,
          userEmail: appointment.client.email,
          appointmentTitle: appointment.title,
          appointmentDate: appointment.startDate,
          appointmentType: appointment.type,
          location: appointment.location || 'Non specificato',
          agentName: `${appointment.agent.firstName} ${appointment.agent.lastName}`,
          propertyTitle: appointment.property ? appointment.property.title : null,
          appointmentId: appointment.id
        });
      }

      // Notifica all'agente
      if (appointment.agent && appointment.agent.user) {
        await notifyAppointmentUpdated({
          userId: appointment.agent.user.id,
          userName: `${appointment.agent.firstName} ${appointment.agent.lastName}`,
          userEmail: appointment.agent.email,
          appointmentTitle: appointment.title,
          appointmentDate: appointment.startDate,
          appointmentType: appointment.type,
          location: appointment.location || 'Non specificato',
          agentName: `${appointment.agent.firstName} ${appointment.agent.lastName}`,
          propertyTitle: appointment.property ? appointment.property.title : null,
          appointmentId: appointment.id
        });
      }
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Errore aggiornamento appuntamento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DELETE /api/crm/appointments/:id - Elimina appuntamento
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          as: 'client',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Agent,
          as: 'agent',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Property,
          as: 'property'
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appuntamento non trovato'
      });
    }

    // Invia notifiche di cancellazione prima di eliminare
    // Notifica al cliente
    if (appointment.client && appointment.client.user) {
      await notifyAppointmentCancelled({
        userId: appointment.client.user.id,
        userName: `${appointment.client.firstName} ${appointment.client.lastName}`,
        userEmail: appointment.client.email,
        appointmentTitle: appointment.title,
        appointmentDate: appointment.startDate,
        appointmentType: appointment.type,
        agentName: `${appointment.agent.firstName} ${appointment.agent.lastName}`,
        propertyTitle: appointment.property ? appointment.property.title : null,
        cancellationReason: 'Appuntamento cancellato'
      });
    }

    // Notifica all'agente
    if (appointment.agent && appointment.agent.user) {
      await notifyAppointmentCancelled({
        userId: appointment.agent.user.id,
        userName: `${appointment.agent.firstName} ${appointment.agent.lastName}`,
        userEmail: appointment.agent.email,
        appointmentTitle: appointment.title,
        appointmentDate: appointment.startDate,
        appointmentType: appointment.type,
        agentName: `${appointment.agent.firstName} ${appointment.agent.lastName}`,
        propertyTitle: appointment.property ? appointment.property.title : null,
        cancellationReason: 'Appuntamento cancellato'
      });
    }

    await appointment.destroy();

    res.json({
      success: true,
      message: 'Appuntamento eliminato con successo'
    });
  } catch (error) {
    console.error('Errore eliminazione appuntamento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/appointments/calendar/:partnerId - Calendario appuntamenti
// ============================================
router.get('/calendar/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { agentId, month, year } = req.query;

    const where = { partnerId };
    if (agentId) where.agentId = agentId;

    // Se specificati mese e anno, filtra per quel periodo
    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      where.startDate = {
        [Op.gte]: startOfMonth,
        [Op.lte]: endOfMonth
      };
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address']
        }
      ],
      order: [['startDate', 'ASC']]
    });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Errore calendario appuntamenti:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/crm/appointments/stats/:partnerId - Statistiche appuntamenti
// ============================================
router.get('/stats/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;

    // Conta appuntamenti per stato
    const byStatus = await Appointment.findAll({
      where: { partnerId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Conta appuntamenti per tipo
    const byType = await Appointment.findAll({
      where: { partnerId },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    // Totale appuntamenti
    const total = await Appointment.count({ where: { partnerId } });

    // Appuntamenti oggi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await Appointment.count({
      where: {
        partnerId,
        startDate: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    // Appuntamenti questa settimana
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const thisWeekCount = await Appointment.count({
      where: {
        partnerId,
        startDate: {
          [Op.gte]: startOfWeek,
          [Op.lt]: endOfWeek
        }
      }
    });

    res.json({
      success: true,
      stats: {
        total,
        today: todayCount,
        thisWeek: thisWeekCount,
        byStatus,
        byType
      }
    });
  } catch (error) {
    console.error('Errore statistiche appuntamenti:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
