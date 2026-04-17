import express from 'express';
import sequelize from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/mls/properties
 * Ottieni tutti gli immobili MLS disponibili (esclusi i propri)
 */
router.get('/properties', authenticateToken, async (req, res) => {
  try {
    const { city, minPrice, maxPrice, propertyType, bedrooms, page = 1, limit = 20 } = req.query;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Ottieni il partner ID dell'utente loggato
    let partnerIdClause = '';
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });

      if (partners.length > 0) {
        partnerIdClause = `AND p."partnerId" != ${partners[0].id}`;
      }
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });

      if (agents.length > 0) {
        partnerIdClause = `AND p."partnerId" != ${agents[0].partnerId}`;
      }
    }

    // Costruisci filtri
    let filters = [];
    let replacements = {};

    if (city) {
      filters.push(`p.city ILIKE :city`);
      replacements.city = `%${city}%`;
    }
    if (minPrice) {
      filters.push(`p.price >= :minPrice`);
      replacements.minPrice = minPrice;
    }
    if (maxPrice) {
      filters.push(`p.price <= :maxPrice`);
      replacements.maxPrice = maxPrice;
    }
    if (propertyType) {
      filters.push(`p."propertyType" = :propertyType`);
      replacements.propertyType = propertyType;
    }
    if (bedrooms) {
      filters.push(`p.bedrooms >= :bedrooms`);
      replacements.bedrooms = bedrooms;
    }

    const whereClause = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';

    // Get total count for pagination
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM properties p
      WHERE p.mls_enabled = true
        AND p.allow_collaboration = true
        AND p.status = 'available'
        ${partnerIdClause}
        ${whereClause}
    `, { replacements });

    const total = parseInt(countResult[0].total);

    // Get paginated results
    const [properties] = await sequelize.query(`
      SELECT
        p.*,
        pt."companyName" as partner_company_name,
        pt.logo as partner_logo,
        u."firstName" || ' ' || u."lastName" as listing_agent_name,
        u.email as listing_agent_email,
        (
          SELECT COUNT(*)
          FROM mls_collaborations mc
          WHERE mc.property_id = p.id AND mc.status = 'active'
        ) as active_collaborations
      FROM properties p
      LEFT JOIN partners pt ON p."partnerId" = pt.id
      LEFT JOIN users u ON p.listing_agent_id = u.id
      WHERE p.mls_enabled = true
        AND p.allow_collaboration = true
        AND p.status = 'available'
        ${partnerIdClause}
        ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT :limit OFFSET :offset
    `, { replacements: { ...replacements, limit: parseInt(limit), offset } });

    res.json({
      success: true,
      properties,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching MLS properties:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero degli immobili MLS'
    });
  }
});

/**
 * GET /api/mls/properties/:id
 * Dettaglio immobile MLS
 */
router.get('/properties/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [properties] = await sequelize.query(`
      SELECT
        p.*,
        pt."companyName" as partner_company_name,
        pt.logo as partner_logo,
        pt.phone as partner_phone,
        pt.email as partner_email,
        u."firstName" || ' ' || u."lastName" as listing_agent_name,
        u.email as listing_agent_email
      FROM properties p
      LEFT JOIN partners pt ON p."partnerId" = pt.id
      LEFT JOIN users u ON p.listing_agent_id = u.id
      WHERE p.id = :id AND p.mls_enabled = true
    `, { replacements: { id } });

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Immobile non trovato o non disponibile su MLS'
      });
    }

    // Carica collaborazioni esistenti
    const [collaborations] = await sequelize.query(`
      SELECT
        mc.*,
        pt."companyName" as collaborating_company_name,
        u."firstName" || ' ' || u."lastName" as collaborating_agent_name
      FROM mls_collaborations mc
      LEFT JOIN partners pt ON mc.collaborating_partner_id = pt.id
      LEFT JOIN agents ag ON mc.collaborating_agent_id = ag.id
      LEFT JOIN users u ON ag."userId" = u.id
      WHERE mc.property_id = :id
      ORDER BY mc.created_at DESC
    `, { replacements: { id } });

    res.json({
      success: true,
      property: properties[0],
      collaborations
    });

  } catch (error) {
    console.error('Error fetching MLS property detail:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero del dettaglio immobile'
    });
  }
});

/**
 * POST /api/mls/collaborations/request
 * Richiedi collaborazione su un immobile MLS
 */
router.post('/collaborations/request', authenticateToken, async (req, res) => {
  try {
    const { propertyId, notes, proposedCommissionSplit } = req.body;

    // Ottieni partner/agent ID
    let partnerIdQuery, agentId = null;

    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });

      if (partners.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Partner non trovato'
        });
      }
      partnerIdQuery = partners[0].id;
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT id, "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });

      if (agents.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Agente non trovato'
        });
      }
      partnerIdQuery = agents[0].partnerId;
      agentId = agents[0].id;
    }

    // Verifica che l'immobile esista e sia MLS-enabled
    const [properties] = await sequelize.query(`
      SELECT
        p.*,
        p."partnerId" as listing_partner_id
      FROM properties p
      WHERE p.id = :propertyId
        AND p.mls_enabled = true
        AND p.allow_collaboration = true
    `, { replacements: { propertyId } });

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Immobile non disponibile per collaborazione MLS'
      });
    }

    const property = properties[0];

    // Verifica che non sia il proprio immobile
    if (property.listing_partner_id === partnerIdQuery) {
      return res.status(400).json({
        success: false,
        message: 'Non puoi richiedere collaborazione sui tuoi immobili'
      });
    }

    // Verifica se c'è già una collaborazione attiva/pending
    const [existing] = await sequelize.query(`
      SELECT * FROM mls_collaborations
      WHERE property_id = :propertyId
        AND collaborating_partner_id = :partnerId
        AND status IN ('pending', 'approved', 'active')
    `, {
      replacements: {
        propertyId,
        partnerId: partnerIdQuery
      }
    });

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Hai già una collaborazione attiva o in attesa per questo immobile'
      });
    }

    // Crea richiesta collaborazione
    const commissionSplit = proposedCommissionSplit || property.commission_split_percentage || 50;

    const [result] = await sequelize.query(`
      INSERT INTO mls_collaborations (
        property_id,
        listing_partner_id,
        collaborating_partner_id,
        collaborating_agent_id,
        status,
        commission_split,
        notes,
        created_at,
        updated_at
      ) VALUES (
        :propertyId,
        :listingPartnerId,
        :collaboratingPartnerId,
        :collaboratingAgentId,
        'pending',
        :commissionSplit,
        :notes,
        NOW(),
        NOW()
      )
      RETURNING *
    `, {
      replacements: {
        propertyId,
        listingPartnerId: property.listing_partner_id,
        collaboratingPartnerId: partnerIdQuery,
        collaboratingAgentId: agentId,
        commissionSplit,
        notes
      }
    });

    console.log('✅ Nuova richiesta collaborazione MLS creata:', result[0].id);

    res.status(201).json({
      success: true,
      message: 'Richiesta di collaborazione inviata con successo',
      collaboration: result[0]
    });

  } catch (error) {
    console.error('Error requesting collaboration:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la richiesta di collaborazione'
    });
  }
});

/**
 * GET /api/mls/collaborations/my-requests
 * Le mie richieste di collaborazione (come collaborator)
 */
router.get('/collaborations/my-requests', authenticateToken, async (req, res) => {
  try {
    // Ottieni partner ID
    let partnerId;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      partnerId = partners[0]?.id;
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      partnerId = agents[0]?.partnerId;
    }

    if (!partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    const [collaborations] = await sequelize.query(`
      SELECT
        mc.*,
        p.title as property_title,
        p.price as property_price,
        p.city as property_city,
        p.images as property_images,
        pt."companyName" as listing_partner_company
      FROM mls_collaborations mc
      LEFT JOIN properties p ON mc.property_id = p.id
      LEFT JOIN partners pt ON mc.listing_partner_id = pt.id
      WHERE mc.collaborating_partner_id = :partnerId
      ORDER BY mc.created_at DESC
    `, { replacements: { partnerId } });

    res.json({
      success: true,
      collaborations
    });

  } catch (error) {
    console.error('Error fetching my collaboration requests:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle richieste'
    });
  }
});

/**
 * GET /api/mls/collaborations/incoming
 * Richieste di collaborazione ricevute (come listing partner)
 */
router.get('/collaborations/incoming', authenticateToken, async (req, res) => {
  try {
    // Ottieni partner ID
    let partnerId;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      partnerId = partners[0]?.id;
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      partnerId = agents[0]?.partnerId;
    }

    if (!partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    const [collaborations] = await sequelize.query(`
      SELECT
        mc.*,
        p.title as property_title,
        p.price as property_price,
        p.city as property_city,
        p.images as property_images,
        pt."companyName" as collaborating_partner_company,
        pt.logo as collaborating_partner_logo,
        u."firstName" || ' ' || u."lastName" as collaborating_agent_name
      FROM mls_collaborations mc
      LEFT JOIN properties p ON mc.property_id = p.id
      LEFT JOIN partners pt ON mc.collaborating_partner_id = pt.id
      LEFT JOIN agents ag ON mc.collaborating_agent_id = ag.id
      LEFT JOIN users u ON ag."userId" = u.id
      WHERE mc.listing_partner_id = :partnerId
      ORDER BY
        CASE mc.status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'active' THEN 3
          ELSE 4
        END,
        mc.created_at DESC
    `, { replacements: { partnerId } });

    res.json({
      success: true,
      collaborations
    });

  } catch (error) {
    console.error('Error fetching incoming collaboration requests:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle richieste'
    });
  }
});

/**
 * PATCH /api/mls/collaborations/:id/approve
 * Approva richiesta collaborazione
 */
router.patch('/collaborations/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Ottieni partner ID
    let partnerId;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      partnerId = partners[0]?.id;
    }

    if (!partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Solo il listing partner può approvare'
      });
    }

    // Verifica ownership
    const [collaborations] = await sequelize.query(`
      SELECT * FROM mls_collaborations
      WHERE id = :id AND listing_partner_id = :partnerId
    `, { replacements: { id, partnerId } });

    if (collaborations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Collaborazione non trovata'
      });
    }

    await sequelize.query(`
      UPDATE mls_collaborations
      SET
        status = 'approved',
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = :id
    `, { replacements: { id } });

    res.json({
      success: true,
      message: 'Collaborazione approvata'
    });

  } catch (error) {
    console.error('Error approving collaboration:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'approvazione'
    });
  }
});

/**
 * PATCH /api/mls/collaborations/:id/reject
 * Rifiuta richiesta collaborazione
 */
router.patch('/collaborations/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Ottieni partner ID
    let partnerId;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      partnerId = partners[0]?.id;
    }

    if (!partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Solo il listing partner può rifiutare'
      });
    }

    // Verifica ownership
    const [collaborations] = await sequelize.query(`
      SELECT * FROM mls_collaborations
      WHERE id = :id AND listing_partner_id = :partnerId
    `, { replacements: { id, partnerId } });

    if (collaborations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Collaborazione non trovata'
      });
    }

    await sequelize.query(`
      UPDATE mls_collaborations
      SET
        status = 'rejected',
        updated_at = NOW()
      WHERE id = :id
    `, { replacements: { id } });

    res.json({
      success: true,
      message: 'Collaborazione rifiutata'
    });

  } catch (error) {
    console.error('Error rejecting collaboration:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il rifiuto'
    });
  }
});

/**
 * GET /api/mls/stats
 * Statistiche MLS per il partner
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Ottieni partner ID
    let partnerId;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      partnerId = partners[0]?.id;
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      partnerId = agents[0]?.partnerId;
    }

    if (!partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Partner non trovato'
      });
    }

    // Statistiche listing
    const [listingStats] = await sequelize.query(`
      SELECT
        COUNT(*) as total_mls_listings,
        COUNT(*) FILTER (WHERE status = 'available') as active_listings,
        COUNT(*) FILTER (WHERE sold_date IS NOT NULL) as sold_listings,
        AVG(days_on_market) FILTER (WHERE days_on_market IS NOT NULL) as avg_days_to_sell
      FROM properties
      WHERE "partnerId" = :partnerId AND mls_enabled = true
    `, { replacements: { partnerId } });

    // Statistiche collaborazioni
    const [collabStats] = await sequelize.query(`
      SELECT
        COUNT(*) as total_collaborations,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_collaborations,
        COUNT(*) FILTER (WHERE status = 'active') as active_collaborations,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_collaborations
      FROM mls_collaborations
      WHERE collaborating_partner_id = :partnerId
    `, { replacements: { partnerId } });

    // Richieste in arrivo
    const [incomingStats] = await sequelize.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending_requests
      FROM mls_collaborations
      WHERE listing_partner_id = :partnerId
    `, { replacements: { partnerId } });

    res.json({
      success: true,
      stats: {
        ...listingStats[0],
        ...collabStats[0],
        ...incomingStats[0]
      }
    });

  } catch (error) {
    console.error('Error fetching MLS stats:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle statistiche'
    });
  }
});

/**
 * GET /api/mls/leads
 * Ottieni i lead MLS (filtrabili per status)
 */
router.get('/leads', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;

    // Ottieni partner ID
    let partnerIdQuery = null;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (partners.length > 0) {
        partnerIdQuery = partners[0].id;
      }
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (agents.length > 0) {
        partnerIdQuery = agents[0].partnerId;
      }
    }

    if (!partnerIdQuery) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    // Costruisci query
    let statusFilter = '';
    let replacements = { partnerId: partnerIdQuery };

    if (status && status !== 'all') {
      statusFilter = 'AND l.status = :status';
      replacements.status = status;
    }

    const [leads] = await sequelize.query(`
      SELECT
        l.*,
        p.title as property_title,
        p.city as property_city,
        sp.name as source_partner_name
      FROM mls_leads l
      LEFT JOIN properties p ON l.property_id = p.id
      LEFT JOIN partners sp ON l.source_partner_id = sp.id
      WHERE p."partnerId" = :partnerId
        ${statusFilter}
      ORDER BY l.created_at DESC
    `, { replacements });

    res.json({
      success: true,
      leads
    });

  } catch (error) {
    console.error('Error fetching MLS leads:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero dei lead'
    });
  }
});

/**
 * POST /api/mls/leads
 * Crea un nuovo lead MLS
 */
router.post('/leads', authenticateToken, async (req, res) => {
  try {
    const {
      propertyId,
      clientName,
      clientEmail,
      clientPhone,
      notes,
      leadQuality
    } = req.body;

    // Ottieni partner/agent ID
    let partnerIdQuery = null;
    let agentId = null;

    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (partners.length > 0) {
        partnerIdQuery = partners[0].id;
      }
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT id, "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (agents.length > 0) {
        partnerIdQuery = agents[0].partnerId;
        agentId = agents[0].id;
      }
    }

    if (!partnerIdQuery) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    // Verifica che la proprietà esista
    const [properties] = await sequelize.query(`
      SELECT id, "partnerId" FROM properties WHERE id = :propertyId
    `, { replacements: { propertyId } });

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proprietà non trovata'
      });
    }

    // Crea il lead
    const [result] = await sequelize.query(`
      INSERT INTO mls_leads (
        property_id,
        client_name,
        client_email,
        client_phone,
        source_partner_id,
        source_agent_id,
        status,
        lead_quality,
        notes
      ) VALUES (
        :propertyId,
        :clientName,
        :clientEmail,
        :clientPhone,
        :partnerId,
        :agentId,
        'new',
        :leadQuality,
        :notes
      ) RETURNING *
    `, {
      replacements: {
        propertyId,
        clientName,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
        partnerId: partnerIdQuery,
        agentId: agentId || null,
        leadQuality: leadQuality || 'medium',
        notes: notes || null
      }
    });

    res.status(201).json({
      success: true,
      lead: result[0]
    });

  } catch (error) {
    console.error('Error creating MLS lead:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la creazione del lead'
    });
  }
});

/**
 * PATCH /api/mls/leads/:id
 * Aggiorna lo status di un lead
 */
router.patch('/leads/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, visitDate, offerAmount } = req.body;

    // Ottieni partner ID per verifica ownership
    let partnerIdQuery = null;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (partners.length > 0) {
        partnerIdQuery = partners[0].id;
      }
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (agents.length > 0) {
        partnerIdQuery = agents[0].partnerId;
      }
    }

    if (!partnerIdQuery) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    // Verifica ownership del lead
    const [leads] = await sequelize.query(`
      SELECT l.*, p."partnerId"
      FROM mls_leads l
      JOIN properties p ON l.property_id = p.id
      WHERE l.id = :leadId
    `, { replacements: { leadId: id } });

    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead non trovato'
      });
    }

    if (leads[0].partnerId !== partnerIdQuery) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a modificare questo lead'
      });
    }

    // Costruisci UPDATE query
    let updates = [];
    let replacements = { leadId: id };

    if (status) {
      updates.push('status = :status');
      replacements.status = status;
    }

    if (notes !== undefined) {
      updates.push('notes = :notes');
      replacements.notes = notes;
    }

    if (visitDate) {
      updates.push('visit_scheduled = true, visit_date = :visitDate');
      replacements.visitDate = visitDate;
    }

    if (offerAmount) {
      updates.push('offer_made = true, offer_amount = :offerAmount');
      replacements.offerAmount = offerAmount;
    }

    updates.push('updated_at = NOW()');

    const [result] = await sequelize.query(`
      UPDATE mls_leads
      SET ${updates.join(', ')}
      WHERE id = :leadId
      RETURNING *
    `, { replacements });

    res.json({
      success: true,
      lead: result[0]
    });

  } catch (error) {
    console.error('Error updating MLS lead:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento del lead'
    });
  }
});

/**
 * GET /api/mls/transactions
 * Ottieni le transazioni MLS (filtrabili per status)
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;

    // Ottieni partner ID
    let partnerIdQuery = null;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (partners.length > 0) {
        partnerIdQuery = partners[0].id;
      }
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (agents.length > 0) {
        partnerIdQuery = agents[0].partnerId;
      }
    }

    if (!partnerIdQuery) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    // Costruisci query
    let statusFilter = '';
    let replacements = { partnerId: partnerIdQuery };

    if (status && status !== 'all') {
      statusFilter = 'AND t.status = :status';
      replacements.status = status;
    }

    const [transactions] = await sequelize.query(`
      SELECT
        t.*,
        p.title as property_title,
        p.city as property_city,
        lp.name as listing_partner_name,
        cp.name as collaborating_partner_name
      FROM mls_transactions t
      LEFT JOIN properties p ON t.property_id = p.id
      LEFT JOIN partners lp ON t.listing_partner_id = lp.id
      LEFT JOIN partners cp ON t.collaborating_partner_id = cp.id
      WHERE (t.listing_partner_id = :partnerId OR t.collaborating_partner_id = :partnerId)
        ${statusFilter}
      ORDER BY t.sale_date DESC
    `, { replacements });

    res.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Error fetching MLS transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle transazioni'
    });
  }
});

/**
 * GET /api/mls/collaborations/active
 * Ottieni collaborazioni attive (approved) pronte per finalizzazione
 */
router.get('/collaborations/active', authenticateToken, async (req, res) => {
  try {
    // Ottieni partner ID
    let partnerIdQuery = null;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (partners.length > 0) {
        partnerIdQuery = partners[0].id;
      }
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (agents.length > 0) {
        partnerIdQuery = agents[0].partnerId;
      }
    }

    if (!partnerIdQuery) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    const [collaborations] = await sequelize.query(`
      SELECT
        c.*,
        p.title as property_title,
        cp.name as collaborating_partner_name
      FROM mls_collaborations c
      JOIN properties p ON c.property_id = p.id
      LEFT JOIN partners cp ON c.collaborating_partner_id = cp.id
      WHERE c.listing_partner_id = :partnerId
        AND c.status = 'approved'
        AND NOT EXISTS (
          SELECT 1 FROM mls_transactions t
          WHERE t.collaboration_id = c.id
        )
      ORDER BY c.approved_at DESC
    `, { replacements: { partnerId: partnerIdQuery } });

    res.json({
      success: true,
      collaborations
    });

  } catch (error) {
    console.error('Error fetching active collaborations:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle collaborazioni attive'
    });
  }
});

/**
 * POST /api/mls/transactions
 * Crea una nuova transazione (registra vendita)
 */
router.post('/transactions', authenticateToken, async (req, res) => {
  try {
    const {
      collaborationId,
      salePrice,
      totalCommission,
      saleDate,
      notes
    } = req.body;

    // Ottieni partner ID
    let partnerIdQuery = null;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (partners.length > 0) {
        partnerIdQuery = partners[0].id;
      }
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (agents.length > 0) {
        partnerIdQuery = agents[0].partnerId;
      }
    }

    if (!partnerIdQuery) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    // Verifica la collaborazione
    const [collaborations] = await sequelize.query(`
      SELECT * FROM mls_collaborations
      WHERE id = :collaborationId
        AND listing_partner_id = :partnerId
        AND status = 'approved'
    `, {
      replacements: {
        collaborationId,
        partnerId: partnerIdQuery
      }
    });

    if (collaborations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Collaborazione non trovata o non autorizzata'
      });
    }

    const collaboration = collaborations[0];

    // Calcola split commissioni
    const listingCommission = (totalCommission * (100 - collaboration.commission_split)) / 100;
    const collaboratingCommission = (totalCommission * collaboration.commission_split) / 100;

    // Crea transazione
    const [result] = await sequelize.query(`
      INSERT INTO mls_transactions (
        property_id,
        collaboration_id,
        sale_price,
        total_commission,
        listing_agent_commission,
        collaborating_agent_commission,
        listing_partner_id,
        collaborating_partner_id,
        status,
        payment_status,
        sale_date,
        notes
      ) VALUES (
        :propertyId,
        :collaborationId,
        :salePrice,
        :totalCommission,
        :listingCommission,
        :collaboratingCommission,
        :listingPartnerId,
        :collaboratingPartnerId,
        'completed',
        'pending',
        :saleDate,
        :notes
      ) RETURNING *
    `, {
      replacements: {
        propertyId: collaboration.property_id,
        collaborationId,
        salePrice: parseFloat(salePrice),
        totalCommission: parseFloat(totalCommission),
        listingCommission,
        collaboratingCommission,
        listingPartnerId: collaboration.listing_partner_id,
        collaboratingPartnerId: collaboration.collaborating_partner_id,
        saleDate,
        notes: notes || null
      }
    });

    // Aggiorna la collaborazione come completata
    await sequelize.query(`
      UPDATE mls_collaborations
      SET status = 'completed', completed_at = NOW()
      WHERE id = :collaborationId
    `, { replacements: { collaborationId } });

    // Aggiorna la proprietà come venduta
    await sequelize.query(`
      UPDATE properties
      SET status = 'sold', sold_price = :salePrice, sold_date = :saleDate
      WHERE id = :propertyId
    `, {
      replacements: {
        propertyId: collaboration.property_id,
        salePrice: parseFloat(salePrice),
        saleDate
      }
    });

    res.status(201).json({
      success: true,
      transaction: result[0]
    });

  } catch (error) {
    console.error('Error creating MLS transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la creazione della transazione'
    });
  }
});

/**
 * PATCH /api/mls/transactions/:id/mark-paid
 * Segna una transazione come pagata
 */
router.patch('/transactions/:id/mark-paid', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Ottieni partner ID
    let partnerIdQuery = null;
    if (req.user.role === 'partner') {
      const [partners] = await sequelize.query(`
        SELECT id FROM partners WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (partners.length > 0) {
        partnerIdQuery = partners[0].id;
      }
    } else if (req.user.role === 'agent') {
      const [agents] = await sequelize.query(`
        SELECT "partnerId" FROM agents WHERE "userId" = :userId
      `, { replacements: { userId: req.user.id } });
      if (agents.length > 0) {
        partnerIdQuery = agents[0].partnerId;
      }
    }

    if (!partnerIdQuery) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    // Verifica ownership
    const [transactions] = await sequelize.query(`
      SELECT * FROM mls_transactions
      WHERE id = :transactionId
        AND (listing_partner_id = :partnerId OR collaborating_partner_id = :partnerId)
    `, {
      replacements: {
        transactionId: id,
        partnerId: partnerIdQuery
      }
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transazione non trovata'
      });
    }

    // Aggiorna payment status
    const [result] = await sequelize.query(`
      UPDATE mls_transactions
      SET payment_status = 'paid', payment_date = NOW(), updated_at = NOW()
      WHERE id = :transactionId
      RETURNING *
    `, { replacements: { transactionId: id } });

    res.json({
      success: true,
      transaction: result[0]
    });

  } catch (error) {
    console.error('Error marking transaction as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento del pagamento'
    });
  }
});

export default router;
