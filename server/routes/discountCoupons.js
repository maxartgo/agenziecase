import express from 'express';
import DiscountCoupon from '../models/DiscountCoupon.js';

const router = express.Router();

// GET /api/admin/coupons - Lista tutti i coupon
router.get('/', async (req, res) => {
  try {
    const { includeInactive = false } = req.query;

    const whereClause = {};
    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }

    const coupons = await DiscountCoupon.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      coupons
    });
  } catch (error) {
    console.error('Errore get coupons:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dei coupon'
    });
  }
});

// GET /api/admin/coupons/:id - Dettagli coupon
router.get('/:id', async (req, res) => {
  try {
    const coupon = await DiscountCoupon.findByPk(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon non trovato'
      });
    }

    res.json({
      success: true,
      coupon
    });
  } catch (error) {
    console.error('Errore get coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero del coupon'
    });
  }
});

// POST /api/admin/coupons - Crea nuovo coupon
router.post('/', async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      applicablePlans,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      isActive
    } = req.body;

    // Validazioni
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({
        success: false,
        error: 'Codice, tipo di sconto e valore sono richiesti'
      });
    }

    // Verifica che il codice sia unico
    const existingCoupon = await DiscountCoupon.findOne({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        error: 'Codice coupon già esistente'
      });
    }

    // Validazione valore sconto
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Lo sconto percentuale deve essere tra 0 e 100'
      });
    }

    if (discountType === 'fixed' && discountValue < 0) {
      return res.status(400).json({
        success: false,
        error: 'Lo sconto fisso deve essere maggiore di 0'
      });
    }

    // Validazione date
    if (validFrom && validUntil && new Date(validFrom) >= new Date(validUntil)) {
      return res.status(400).json({
        success: false,
        error: 'La data di inizio deve essere precedente alla data di fine'
      });
    }

    const coupon = await DiscountCoupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minPurchase: minPurchase || 0,
      applicablePlans: applicablePlans || [],
      usageLimit: usageLimit || null,
      userUsageLimit: userUsageLimit || 1,
      validFrom: validFrom || new Date(),
      validUntil: validUntil || null,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Coupon creato con successo',
      coupon
    });
  } catch (error) {
    console.error('Errore create coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nella creazione del coupon'
    });
  }
});

// PUT /api/admin/coupons/:id - Aggiorna coupon
router.put('/:id', async (req, res) => {
  try {
    const coupon = await DiscountCoupon.findByPk(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon non trovato'
      });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      applicablePlans,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      isActive
    } = req.body;

    // Se si sta cambiando il codice, verifica che sia unico
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await DiscountCoupon.findOne({
        where: { code: code.toUpperCase() }
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          error: 'Codice coupon già esistente'
        });
      }
    }

    // Aggiorna i campi
    const updates = {};
    if (code) updates.code = code.toUpperCase();
    if (description !== undefined) updates.description = description;
    if (discountType) updates.discountType = discountType;
    if (discountValue) updates.discountValue = discountValue;
    if (maxDiscount !== undefined) updates.maxDiscount = maxDiscount;
    if (minPurchase !== undefined) updates.minPurchase = minPurchase;
    if (applicablePlans !== undefined) updates.applicablePlans = applicablePlans;
    if (usageLimit !== undefined) updates.usageLimit = usageLimit;
    if (userUsageLimit !== undefined) updates.userUsageLimit = userUsageLimit;
    if (validFrom) updates.validFrom = validFrom;
    if (validUntil !== undefined) updates.validUntil = validUntil;
    if (isActive !== undefined) updates.isActive = isActive;

    await coupon.update(updates);

    res.json({
      success: true,
      message: 'Coupon aggiornato con successo',
      coupon
    });
  } catch (error) {
    console.error('Errore update coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'aggiornamento del coupon'
    });
  }
});

// DELETE /api/admin/coupons/:id - Elimina coupon
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await DiscountCoupon.findByPk(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon non trovato'
      });
    }

    await coupon.destroy();

    res.json({
      success: true,
      message: 'Coupon eliminato con successo'
    });
  } catch (error) {
    console.error('Errore delete coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'eliminazione del coupon'
    });
  }
});

// POST /api/admin/coupons/:id/toggle - Attiva/disattiva coupon
router.post('/:id/toggle', async (req, res) => {
  try {
    const coupon = await DiscountCoupon.findByPk(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon non trovato'
      });
    }

    await coupon.update({ isActive: !coupon.isActive });

    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'disattivato' : 'attivato'} con successo`,
      coupon
    });
  } catch (error) {
    console.error('Errore toggle coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'attivazione/disattivazione del coupon'
    });
  }
});

export default router;