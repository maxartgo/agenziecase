import express from 'express';
import sequelize from '../../config/database.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/crm-subscriptions
 * Ottieni tutti gli abbonamenti CRM (solo Admin)
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

    // Recupera tutti i partner con i loro abbonamenti CRM
    const [subscriptions] = await sequelize.query(`
      SELECT
        p.id,
        p."companyName",
        p.email,
        p."vatNumber",
        p."crmSubscriptionActive",
        p."crmSubscriptionPlan",
        p."crmTeamSize",
        p."crmMonthlyPrice",
        p."crmAnnualPrice",
        p."crmSubscriptionStart",
        p."crmSubscriptionEnd",
        p."crmPaymentType",
        p."crmLastPayment",
        p."crmAutoRenew",
        p.created_at,
        (
          SELECT COUNT(*)
          FROM agents a
          WHERE a."partnerId" = p.id
        ) as "agentsCount"
      FROM partners p
      ORDER BY p."crmSubscriptionActive" DESC, p.created_at DESC
    `);

    res.json({
      success: true,
      subscriptions
    });

  } catch (error) {
    console.error('Error fetching CRM subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero degli abbonamenti'
    });
  }
});

/**
 * GET /api/admin/crm-subscriptions/stats
 * Ottieni statistiche abbonamenti CRM (solo Admin)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Verifica che l'utente sia Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accesso negato'
      });
    }

    const [stats] = await sequelize.query(`
      SELECT
        COUNT(*) as "totalPartners",
        COUNT(CASE WHEN "crmSubscriptionActive" = true THEN 1 END) as "activeSubscriptions",
        COUNT(CASE WHEN "crmSubscriptionEnd" < NOW() THEN 1 END) as "expiredSubscriptions",
        SUM(CASE
          WHEN "crmPaymentType" = 'annual' THEN "crmAnnualPrice"
          WHEN "crmPaymentType" = 'monthly' THEN "crmMonthlyPrice"
          ELSE 0
        END) as "totalRevenue",
        SUM("crmTeamSize") as "totalSeats"
      FROM partners
      WHERE "crmSubscriptionActive" = true
    `);

    // Breakdown per piano
    const [planBreakdown] = await sequelize.query(`
      SELECT
        "crmSubscriptionPlan" as plan,
        COUNT(*) as count,
        SUM("crmTeamSize") as "totalSeats"
      FROM partners
      WHERE "crmSubscriptionActive" = true
      GROUP BY "crmSubscriptionPlan"
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      stats: stats[0],
      planBreakdown
    });

  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle statistiche'
    });
  }
});

/**
 * POST /api/admin/crm-subscriptions/:partnerId/cancel
 * Cancella abbonamento di un partner (solo Admin)
 */
router.post('/:partnerId/cancel', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.params;

    // Verifica che l'utente sia Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accesso negato'
      });
    }

    await sequelize.query(`
      UPDATE partners
      SET
        "crmSubscriptionActive" = false,
        "crmAutoRenew" = false,
        updated_at = NOW()
      WHERE id = :partnerId
    `, {
      replacements: { partnerId }
    });

    res.json({
      success: true,
      message: 'Abbonamento cancellato con successo'
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
 * POST /api/admin/crm-subscriptions/:partnerId/extend
 * Estendi abbonamento di un partner (solo Admin)
 */
router.post('/:partnerId/extend', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { months } = req.body;

    // Verifica che l'utente sia Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accesso negato'
      });
    }

    await sequelize.query(`
      UPDATE partners
      SET
        "crmSubscriptionEnd" = "crmSubscriptionEnd" + INTERVAL '${months} months',
        updated_at = NOW()
      WHERE id = :partnerId
    `, {
      replacements: { partnerId }
    });

    res.json({
      success: true,
      message: `Abbonamento esteso di ${months} ${months === 1 ? 'mese' : 'mesi'}`
    });

  } catch (error) {
    console.error('Error extending subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'estensione'
    });
  }
});

/**
 * POST /api/admin/crm-subscriptions/:partnerId/activate
 * Attiva manualmente un abbonamento per un partner (solo Admin)
 */
router.post('/:partnerId/activate', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { teamSize, paymentType = 'annual' } = req.body;

    // Verifica che l'utente sia Admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accesso negato. Solo gli admin possono attivare abbonamenti.'
      });
    }

    if (!teamSize || teamSize < 1) {
      return res.status(400).json({
        success: false,
        message: 'Team size richiesto (minimo 1)'
      });
    }

    // Calcola prezzi in base al team size
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
      // Valori intermedi
      if (teamSize < 5) {
        monthlyPrice = 22 + ((teamSize - 1) * ((55 - 22) / 4));
      } else if (teamSize < 10) {
        monthlyPrice = 55 + ((teamSize - 5) * ((100 - 55) / 5));
      } else {
        monthlyPrice = teamSize * 9;
      }
    }

    const annualPrice = monthlyPrice * 12;

    // Determina il piano
    let plan = 'custom';
    if (teamSize === 1) plan = 'single';
    else if (teamSize === 5) plan = 'team_5';
    else if (teamSize === 10) plan = 'team_10';
    else if (teamSize >= 15) plan = 'team_15_plus';

    // Calcola date
    const startDate = new Date();
    const endDate = new Date();
    if (paymentType === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Attiva abbonamento
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
        monthlyPrice: Math.round(monthlyPrice * 100) / 100,
        annualPrice: Math.round(annualPrice * 100) / 100,
        startDate,
        endDate,
        paymentType,
        partnerId
      }
    });

    // Registra il pagamento (come admin manual activation)
    const amount = paymentType === 'annual' ? annualPrice : monthlyPrice;
    await sequelize.query(`
      INSERT INTO crm_subscription_payments (
        partner_id, amount, payment_type, team_size, plan,
        payment_status, payment_method, created_at, updated_at
      ) VALUES (
        :partnerId, :amount, :paymentType, :teamSize, :plan,
        'completed', 'admin_activation', NOW(), NOW()
      )
    `, {
      replacements: {
        partnerId,
        amount: Math.round(amount * 100) / 100,
        paymentType,
        teamSize,
        plan
      }
    });

    res.json({
      success: true,
      message: 'Abbonamento attivato con successo',
      subscription: {
        plan,
        teamSize,
        monthlyPrice: Math.round(monthlyPrice * 100) / 100,
        annualPrice: Math.round(annualPrice * 100) / 100,
        startDate,
        endDate,
        paymentType
      }
    });

  } catch (error) {
    console.error('Error activating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'attivazione dell\'abbonamento'
    });
  }
});

export default router;
