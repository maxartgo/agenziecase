import express from 'express';
import sequelize from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/virtual-tour-packs
 * Ottiene lista pack disponibili
 */
router.get('/', async (req, res) => {
  try {
    const packs = await sequelize.query(`
      SELECT
        id,
        plan_type,
        plan_name,
        credits_included,
        price_monthly,
        features,
        is_active
      FROM virtual_tour_packs
      WHERE is_active = true
      ORDER BY price_monthly ASC
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({
      success: true,
      packs
    });

  } catch (error) {
    console.error('❌ Error fetching packs:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei pack',
      error: error.message
    });
  }
});

/**
 * GET /api/virtual-tour-packs/credits
 * Ottiene crediti rimanenti del partner autenticato
 * Richiede autenticazione
 */
router.get('/credits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Recupera dati partner
    const [partner] = await sequelize.query(`
      SELECT
        vt_plan,
        vt_credits,
        vt_plan_start_date,
        vt_plan_renew_date
      FROM partners
      WHERE "userId" = :userId
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    // Se ha un piano, recupera info pack
    let packInfo = null;
    if (partner.vt_plan) {
      [packInfo] = await sequelize.query(`
        SELECT plan_name, credits_included, price_monthly
        FROM virtual_tour_packs
        WHERE plan_type = :planType
      `, {
        replacements: { planType: partner.vt_plan },
        type: sequelize.QueryTypes.SELECT
      });
    }

    res.json({
      success: true,
      credits: {
        current: partner.vt_credits || 0,
        plan: partner.vt_plan,
        planName: packInfo?.plan_name,
        creditsIncluded: packInfo?.credits_included,
        priceMonthly: packInfo?.price_monthly,
        startDate: partner.vt_plan_start_date,
        renewDate: partner.vt_plan_renew_date
      }
    });

  } catch (error) {
    console.error('❌ Error fetching credits:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei crediti',
      error: error.message
    });
  }
});

/**
 * POST /api/virtual-tour-packs/purchase
 * Acquista un pack virtual tour
 * Richiede autenticazione (solo Partner)
 */
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { planType, paymentMethod = 'manual', paymentId } = req.body;

    // Validazione
    if (!planType) {
      return res.status(400).json({
        success: false,
        message: 'Plan type richiesto'
      });
    }

    // Verifica che l'utente sia Partner
    if (req.user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        message: 'Solo i Partner possono acquistare pack Virtual Tour'
      });
    }

    // Recupera info pack
    const [pack] = await sequelize.query(`
      SELECT * FROM virtual_tour_packs
      WHERE plan_type = :planType AND is_active = true
    `, {
      replacements: { planType },
      type: sequelize.QueryTypes.SELECT
    });

    if (!pack) {
      return res.status(404).json({
        success: false,
        message: 'Pack non trovato'
      });
    }

    // Recupera partner
    const [partner] = await sequelize.query(`
      SELECT id FROM partners WHERE user_id = :userId
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    // Calcola date
    const now = new Date();
    const renewDate = new Date(now);
    renewDate.setMonth(renewDate.getMonth() + 1);

    // Aggiorna partner con nuovo piano e crediti
    await sequelize.query(`
      UPDATE partners
      SET
        vt_plan = :planType,
        vt_credits = :credits,
        vt_plan_start_date = :startDate,
        vt_plan_renew_date = :renewDate
      WHERE id = :partnerId
    `, {
      replacements: {
        planType: pack.plan_type,
        credits: pack.credits_included,
        startDate: now,
        renewDate,
        partnerId: partner.id
      }
    });

    // Registra acquisto in storico
    await sequelize.query(`
      INSERT INTO virtual_tour_purchases (
        partner_id,
        plan_type,
        credits_purchased,
        amount_paid,
        payment_method,
        payment_id
      ) VALUES (
        :partnerId,
        :planType,
        :credits,
        :amount,
        :paymentMethod,
        :paymentId
      )
    `, {
      replacements: {
        partnerId: partner.id,
        planType: pack.plan_type,
        credits: pack.credits_included,
        amount: pack.price_monthly,
        paymentMethod,
        paymentId
      }
    });

    console.log(`✅ Partner ${partner.id} purchased ${pack.plan_name} - ${pack.credits_included} credits`);

    res.json({
      success: true,
      message: `Pack ${pack.plan_name} acquistato con successo!`,
      pack: {
        planType: pack.plan_type,
        planName: pack.plan_name,
        credits: pack.credits_included,
        renewDate
      }
    });

  } catch (error) {
    console.error('❌ Error purchasing pack:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'acquisto del pack',
      error: error.message
    });
  }
});

/**
 * POST /api/virtual-tour-packs/use-credit
 * Consuma 1 credito per creare virtual tour
 * Richiede autenticazione (solo Partner)
 */
router.post('/use-credit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId, tourUrl } = req.body;

    // Validazione
    if (!tourUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL virtual tour richiesto'
      });
    }

    // Verifica che l'utente sia Partner
    if (req.user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        message: 'Solo i Partner possono usare crediti Virtual Tour'
      });
    }

    // Recupera partner
    const [partner] = await sequelize.query(`
      SELECT id, vt_plan, vt_credits
      FROM partners
      WHERE user_id = :userId
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    // Verifica che abbia crediti
    if (!partner.vt_credits || partner.vt_credits < 1) {
      return res.status(400).json({
        success: false,
        message: 'Crediti insufficienti. Acquista un pack Virtual Tour per continuare.',
        credits: partner.vt_credits || 0
      });
    }

    // Decrementa credito
    await sequelize.query(`
      UPDATE partners
      SET vt_credits = vt_credits - 1
      WHERE id = :partnerId
    `, {
      replacements: { partnerId: partner.id }
    });

    // Registra utilizzo
    await sequelize.query(`
      INSERT INTO virtual_tour_usage (
        partner_id,
        property_id,
        tour_url,
        credits_used
      ) VALUES (
        :partnerId,
        :propertyId,
        :tourUrl,
        1
      )
    `, {
      replacements: {
        partnerId: partner.id,
        propertyId: propertyId || null,
        tourUrl
      }
    });

    const remainingCredits = partner.vt_credits - 1;

    console.log(`✅ Partner ${partner.id} used 1 credit - ${remainingCredits} remaining`);

    res.json({
      success: true,
      message: 'Virtual tour creato con successo!',
      creditsRemaining: remainingCredits
    });

  } catch (error) {
    console.error('❌ Error using credit:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'utilizzo del credito',
      error: error.message
    });
  }
});

/**
 * GET /api/virtual-tour-packs/usage-history
 * Ottiene storico utilizzo virtual tour del partner
 * Richiede autenticazione (solo Partner)
 */
router.get('/usage-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Recupera partner
    const [partner] = await sequelize.query(`
      SELECT id FROM partners WHERE user_id = :userId
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    // Recupera storico utilizzo
    const usage = await sequelize.query(`
      SELECT
        vtu.id,
        vtu.tour_url,
        vtu.credits_used,
        vtu.created_at,
        p.title as property_title,
        p.id as property_id
      FROM virtual_tour_usage vtu
      LEFT JOIN properties p ON vtu.property_id = p.id
      WHERE vtu.partner_id = :partnerId
      ORDER BY vtu.created_at DESC
      LIMIT 50
    `, {
      replacements: { partnerId: partner.id },
      type: sequelize.QueryTypes.SELECT
    });

    // Recupera storico acquisti
    const purchases = await sequelize.query(`
      SELECT
        vtp.id,
        vtp.plan_type,
        vtp.credits_purchased,
        vtp.amount_paid,
        vtp.payment_method,
        vtp.purchase_date,
        vtpk.plan_name
      FROM virtual_tour_purchases vtp
      LEFT JOIN virtual_tour_packs vtpk ON vtp.plan_type = vtpk.plan_type
      WHERE vtp.partner_id = :partnerId
      ORDER BY vtp.purchase_date DESC
      LIMIT 20
    `, {
      replacements: { partnerId: partner.id },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      usage,
      purchases
    });

  } catch (error) {
    console.error('❌ Error fetching usage history:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dello storico',
      error: error.message
    });
  }
});

export default router;
