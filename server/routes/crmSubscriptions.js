import express from 'express';
import sequelize from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  notifySubscriptionActivated
} from '../services/notificationService.js';

const router = express.Router();

/**
 * Calcola il prezzo dell'abbonamento CRM in base al team size
 * Logica prezzi:
 * - 1 persona: €22/mese (€264/anno)
 * - 5 persone: €55/mese (€660/anno)
 * - 10 persone: €100/mese (€1200/anno)
 * - 15+ persone: teamSize * €9/mese (calcolato su misura)
 */
function calculateCRMPrice(teamSize, paymentType = 'annual') {
  let monthlyPrice = 0;

  if (teamSize === 1) {
    monthlyPrice = 22;
  } else if (teamSize === 5) {
    monthlyPrice = 55;
  } else if (teamSize === 10) {
    monthlyPrice = 100;
  } else if (teamSize >= 15) {
    monthlyPrice = teamSize * 9;
  } else {
    // Per valori intermedi, calcola proporzionalmente
    if (teamSize < 5) {
      monthlyPrice = 22 + ((teamSize - 1) * ((55 - 22) / 4));
    } else if (teamSize < 10) {
      monthlyPrice = 55 + ((teamSize - 5) * ((100 - 55) / 5));
    } else {
      monthlyPrice = teamSize * 9;
    }
  }

  const annualPrice = monthlyPrice * 12;

  return {
    monthlyPrice: Math.round(monthlyPrice * 100) / 100,
    annualPrice: Math.round(annualPrice * 100) / 100
  };
}

/**
 * GET /api/crm-subscriptions/plans
 * Ottieni i piani disponibili con prezzi
 */
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'single',
      name: 'Piano Singolo',
      teamSize: 1,
      ...calculateCRMPrice(1),
      features: [
        'CRM completo per 1 persona',
        'Gestione clienti illimitati',
        'Appuntamenti e calendario',
        'Gestione trattative',
        'Storico attività',
        'Upload documenti'
      ],
      popular: false
    },
    {
      id: 'team_5',
      name: 'Team 5',
      teamSize: 5,
      ...calculateCRMPrice(5),
      features: [
        'CRM completo per 5 persone',
        'Gestione clienti illimitati',
        'Appuntamenti e calendario condiviso',
        'Gestione trattative di team',
        'Storico attività collaborativo',
        'Upload documenti condivisi',
        'Report e statistiche'
      ],
      popular: true
    },
    {
      id: 'team_10',
      name: 'Team 10',
      teamSize: 10,
      ...calculateCRMPrice(10),
      features: [
        'CRM completo per 10 persone',
        'Gestione clienti illimitati',
        'Appuntamenti e calendario condiviso',
        'Gestione trattative avanzata',
        'Storico attività completo',
        'Upload documenti illimitati',
        'Report e analytics avanzati',
        'Supporto prioritario'
      ],
      popular: false
    },
    {
      id: 'team_15_plus',
      name: 'Team 15+',
      teamSize: 15,
      ...calculateCRMPrice(15),
      isCustom: true,
      features: [
        'CRM completo per 15-50 persone',
        'Tutto incluso nei piani precedenti',
        'Gestione multi-agenzia',
        'API access',
        'Integrazioni custom',
        'Account manager dedicato',
        'Supporto prioritario 24/7'
      ],
      popular: false,
      note: '€9/mese per persona (minimo 15)'
    }
  ];

  res.json({
    success: true,
    plans
  });
});

/**
 * POST /api/crm-subscriptions/calculate
 * Calcola il prezzo per un team size specifico
 */
router.post('/calculate', (req, res) => {
  try {
    const { teamSize } = req.body;

    if (!teamSize || teamSize < 1) {
      return res.status(400).json({
        success: false,
        message: 'Team size deve essere almeno 1'
      });
    }

    if (teamSize > 50) {
      return res.status(400).json({
        success: false,
        message: 'Per team oltre 50 persone, contattare il supporto'
      });
    }

    const pricing = calculateCRMPrice(teamSize);

    res.json({
      success: true,
      teamSize,
      ...pricing,
      savings: Math.round((pricing.monthlyPrice * 12 - pricing.annualPrice) * 100) / 100,
      savingsPercentage: 0 // Annual price is same as monthly * 12 in this model
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel calcolo del prezzo'
    });
  }
});

/**
 * POST /api/crm-subscriptions/subscribe
 * Attiva abbonamento CRM per un partner
 */
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { teamSize, paymentType } = req.body;
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Solo i partner possono sottoscrivere abbonamenti CRM'
      });
    }

    if (!teamSize || teamSize < 1) {
      return res.status(400).json({
        success: false,
        message: 'Team size richiesto'
      });
    }

    if (!['monthly', 'annual'].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: 'Payment type deve essere "monthly" o "annual"'
      });
    }

    // Calcola prezzi
    const pricing = calculateCRMPrice(teamSize, paymentType);
    const amount = paymentType === 'annual' ? pricing.annualPrice : pricing.monthlyPrice;

    // Determina il piano
    let plan = 'custom';
    if (teamSize === 1) plan = 'single';
    else if (teamSize === 5) plan = 'team_5';
    else if (teamSize === 10) plan = 'team_10';
    else if (teamSize >= 15) plan = 'team_15_plus';

    // Calcola date abbonamento
    const startDate = new Date();
    const endDate = new Date();
    if (paymentType === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Aggiorna partner con abbonamento
    await sequelize.query(`
      UPDATE partners
      SET
        "crmSubscriptionActive" = true,
        "crmSubscriptionPlan" = :plan,
        "crmTeamSize" = :teamSize,
        "crmMonthlyPrice" = :monthlyPrice,
        "crmAnnualPrice" = :annualPrice,
        "crmSubscriptionStart" = :startDate,
        "crmSubscriptionEnd" = :endDate,
        "crmPaymentType" = :paymentType,
        "crmLastPayment" = NOW(),
        "crmAutoRenew" = true,
        updated_at = NOW()
      WHERE id = :partnerId
    `, {
      replacements: {
        plan,
        teamSize,
        monthlyPrice: pricing.monthlyPrice,
        annualPrice: pricing.annualPrice,
        startDate,
        endDate,
        paymentType,
        partnerId
      }
    });

    // Registra il pagamento (simulato - in produzione integrare Stripe/PayPal)
    const [payment] = await sequelize.query(`
      INSERT INTO crm_subscription_payments (
        partner_id, amount, payment_type, team_size, plan,
        payment_status, payment_method, created_at, updated_at
      ) VALUES (
        :partnerId, :amount, :paymentType, :teamSize, :plan,
        'completed', 'demo', NOW(), NOW()
      )
      RETURNING *
    `, {
      replacements: {
        partnerId,
        amount,
        paymentType,
        teamSize,
        plan
      }
    });

    // Invia notifica di attivazione abbonamento
    if (req.user.id && req.user.email) {
      const [partnerData] = await sequelize.query(`
        SELECT "companyName", "firstName", "lastName"
        FROM partners
        WHERE id = :partnerId
      `, {
        replacements: { partnerId }
      });

      const partnerName = partnerData[0]?.companyName ||
                          `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
                          'Partner';

      await notifySubscriptionActivated({
        userId: req.user.id,
        userName: partnerName,
        userEmail: req.user.email,
        planName: plan,
        teamSize,
        price: amount,
        paymentType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Abbonamento CRM attivato con successo!',
      subscription: {
        plan,
        teamSize,
        monthlyPrice: pricing.monthlyPrice,
        annualPrice: pricing.annualPrice,
        amount,
        paymentType,
        startDate,
        endDate,
        active: true
      },
      payment: payment[0]
    });

  } catch (error) {
    console.error('Error subscribing to CRM:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la sottoscrizione'
    });
  }
});

/**
 * GET /api/crm-subscriptions/status
 * Ottieni lo stato dell'abbonamento CRM del partner loggato
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Solo i partner possono vedere lo stato dell\'abbonamento'
      });
    }

    const [results] = await sequelize.query(`
      SELECT
        "crmSubscriptionActive",
        "crmSubscriptionPlan",
        "crmTeamSize",
        "crmMonthlyPrice",
        "crmAnnualPrice",
        "crmSubscriptionStart",
        "crmSubscriptionEnd",
        "crmPaymentType",
        "crmLastPayment",
        "crmAutoRenew"
      FROM partners
      WHERE id = :partnerId
    `, {
      replacements: { partnerId }
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    const subscription = results[0];

    // Verifica se l'abbonamento è scaduto
    const isExpired = subscription.crmSubscriptionEnd &&
                      new Date(subscription.crmSubscriptionEnd) < new Date();

    res.json({
      success: true,
      subscription: {
        active: subscription.crmSubscriptionActive && !isExpired,
        plan: subscription.crmSubscriptionPlan || 'none',
        teamSize: subscription.crmTeamSize || 0,
        monthlyPrice: subscription.crmMonthlyPrice || 0,
        annualPrice: subscription.crmAnnualPrice || 0,
        startDate: subscription.crmSubscriptionStart,
        endDate: subscription.crmSubscriptionEnd,
        paymentType: subscription.crmPaymentType || 'none',
        lastPayment: subscription.crmLastPayment,
        autoRenew: subscription.crmAutoRenew,
        isExpired,
        daysRemaining: subscription.crmSubscriptionEnd
          ? Math.ceil((new Date(subscription.crmSubscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24))
          : 0
      }
    });

  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dello stato abbonamento'
    });
  }
});

/**
 * POST /api/crm-subscriptions/cancel
 * Cancella abbonamento CRM
 */
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Solo i partner possono cancellare l\'abbonamento'
      });
    }

    await sequelize.query(`
      UPDATE partners
      SET
        "crmAutoRenew" = false,
        updated_at = NOW()
      WHERE id = :partnerId
    `, {
      replacements: { partnerId }
    });

    res.json({
      success: true,
      message: 'Rinnovo automatico disattivato. L\'abbonamento rimarrà attivo fino alla scadenza.'
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la cancellazione'
    });
  }
});

/**
 * GET /api/crm-subscriptions/payments
 * Ottieni storico pagamenti del partner
 */
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Accesso negato'
      });
    }

    const [payments] = await sequelize.query(`
      SELECT *
      FROM crm_subscription_payments
      WHERE partner_id = :partnerId
      ORDER BY payment_date DESC
    `, {
      replacements: { partnerId }
    });

    res.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei pagamenti'
    });
  }
});

export default router;
