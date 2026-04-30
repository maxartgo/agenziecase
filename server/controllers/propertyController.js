import { Property, Partner, Agent } from '../models/index.js';
import { Op } from 'sequelize';
import { cacheInvalidators } from '../middleware/cache.js';

// GET /api/properties - Lista tutti gli immobili con filtri
export const getAllProperties = async (req, res) => {
  try {
    const {
      type,          // Vendita/Affitto
      city,          // Città
      minPrice,      // Prezzo minimo
      maxPrice,      // Prezzo massimo
      minSqm,        // Superficie minima
      maxSqm,        // Superficie massima
      rooms,         // Numero locali
      energyClass,   // Classe energetica
      featured,      // In evidenza
      status,        // disponibile/venduto/affittato
      search,        // Ricerca testuale
      sortBy,        // Campo ordinamento (price, sqm, created_at)
      sortOrder,     // asc/desc
      limit,         // Numero risultati per pagina
      offset,        // Offset per paginazione
      fields         // Campi da restituire (separati da virgola)
    } = req.query;

    // Costruzione filtri dinamici
    const where = {};

    if (type) where.type = type;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (status) where.status = status;
    if (energyClass) where.energyClass = energyClass;
    if (featured !== undefined) where.featured = featured === 'true';

    if (rooms) where.rooms = parseInt(rooms);

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (minSqm || maxSqm) {
      where.sqm = {};
      if (minSqm) where.sqm[Op.gte] = parseInt(minSqm);
      if (maxSqm) where.sqm[Op.lte] = parseInt(maxSqm);
    }

    // Ricerca testuale su titolo, descrizione, location
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Ordinamento
    const order = [];
    if (sortBy) {
      order.push([sortBy, sortOrder || 'DESC']);
    } else {
      order.push(['created_at', 'DESC']); // Default: più recenti
    }

    // Handle field selection
    let attributes;
    if (fields) {
      // If fields specified, only return those fields (always include id)
      const requestedFields = fields.split(',').map(f => f.trim());
      attributes = ['id', ...requestedFields.filter(f => f !== 'id')];
    }

    // Query con paginazione e eager loading
    const properties = await Property.findAndCountAll({
      where,
      attributes, // Will be undefined if no fields specified (returns all)
      include: [
        {
          model: Partner,
          as: 'agency',
          attributes: fields ? fields.split(',').filter(f =>
            ['id', 'companyName', 'logo', 'email', 'phone'].includes(f.trim())
          ) : ['id', 'companyName', 'logo', 'email', 'phone']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: fields ? fields.split(',').filter(f =>
            ['id', 'position', 'professionalEmail', 'professionalPhone', 'photo'].includes(f.trim())
          ) : ['id', 'position', 'professionalEmail', 'professionalPhone', 'photo']
        }
      ],
      order,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    });

    res.json({
      success: true,
      total: properties.count,
      properties: properties.rows
    });

  } catch (error) {
    console.error('Errore getAllProperties:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET /api/properties/:id - Dettaglio singolo immobile
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.query;

    // Handle field selection
    let attributes;
    if (fields) {
      const requestedFields = fields.split(',').map(f => f.trim());
      attributes = ['id', ...requestedFields.filter(f => f !== 'id')];
    }

    const property = await Property.findByPk(id, {
      attributes,
      include: [
        {
          model: Partner,
          as: 'agency',
          attributes: fields ? fields.split(',').filter(f =>
            ['id', 'companyName', 'logo', 'email', 'phone', 'website'].includes(f.trim())
          ) : ['id', 'companyName', 'logo', 'email', 'phone', 'website']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: fields ? fields.split(',').filter(f =>
            ['id', 'position', 'professionalEmail', 'professionalPhone', 'photo'].includes(f.trim())
          ) : ['id', 'position', 'professionalEmail', 'professionalPhone', 'photo']
        }
      ]
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Immobile non trovato'
      });
    }

    // Incrementa contatore visualizzazioni
    property.viewCount += 1;
    await property.save();

    res.json({
      success: true,
      property
    });

  } catch (error) {
    console.error('Errore getPropertyById:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST /api/properties - Crea nuovo immobile
export const createProperty = async (req, res) => {
  try {
    const propertyData = req.body;

    // Controllo abbonamento CRM per i partner
    if (req.user && req.user.role === 'partner') {
      const partner = await Partner.findOne({ where: { userId: req.user.id } });
      if (!partner || !partner.crmSubscriptionActive) {
        return res.status(403).json({
          success: false,
          error: 'Abbonamento CRM non attivo. Attiva un abbonamento per pubblicare annunci.'
        });
      }
      if (partner.crmSubscriptionEnd && new Date(partner.crmSubscriptionEnd) < new Date()) {
        return res.status(403).json({
          success: false,
          error: 'Abbonamento CRM scaduto. Rinnova il tuo abbonamento per continuare.'
        });
      }
    }

    const newProperty = await Property.create(propertyData);

    // Invalidate cache
    await cacheInvalidators.properties();
    await cacheInvalidators.stats();

    res.status(201).json({
      success: true,
      property: newProperty
    });

  } catch (error) {
    console.error('Errore createProperty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// PUT /api/properties/:id - Aggiorna immobile
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Immobile non trovato'
      });
    }

    await property.update(updates);

    // Invalidate cache
    await cacheInvalidators.properties();
    await cacheInvalidators.stats();

    res.json({
      success: true,
      property
    });

  } catch (error) {
    console.error('Errore updateProperty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// DELETE /api/properties/:id - Elimina immobile
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Immobile non trovato'
      });
    }

    await property.destroy();

    // Invalidate cache
    await cacheInvalidators.properties();
    await cacheInvalidators.stats();

    res.json({
      success: true,
      message: 'Immobile eliminato con successo'
    });

  } catch (error) {
    console.error('Errore deleteProperty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET /api/properties/featured - Immobili in evidenza
export const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: {
        featured: true,
        status: 'disponibile'
      },
      include: [
        {
          model: Partner,
          as: 'agency',
          attributes: ['id', 'companyName', 'logo']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'position', 'professionalEmail']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 6
    });

    res.json({
      success: true,
      properties
    });

  } catch (error) {
    console.error('Errore getFeaturedProperties:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET /api/properties/stats - Statistiche immobili
export const getPropertyStats = async (req, res) => {
  try {
    const [totalProperties, totalVendita, totalAffitto, totalDisponibili] = await Promise.all([
      Property.count(),
      Property.count({ where: { type: 'Vendita' } }),
      Property.count({ where: { type: 'Affitto' } }),
      Property.count({ where: { status: 'disponibile' } })
    ]);

    res.json({
      success: true,
      stats: {
        total: totalProperties,
        vendita: totalVendita,
        affitto: totalAffitto,
        disponibili: totalDisponibili
      }
    });

  } catch (error) {
    console.error('Errore getPropertyStats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
