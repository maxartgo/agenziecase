// server/routes/properties.example.js
// ESEMPIO: Come applicare la validazione alle routes properties

import express from 'express'
import { validate, validateQuery, validateIdParam } from '../middleware/validate.js'
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFilterSchema
} from '../validations/property.validation.js'

const router = express.Router()

/**
 * GET /api/properties
 * Lista proprietà con filtri validati
 */
router.get(
  '/',
  validateQuery(propertyFilterSchema), // ✅ Validazione query string
  async (req, res) => {
    try {
      // I filtri sono già validati e con default values applicati
      const {
        minPrice,
        maxPrice,
        city,
        type,
        status,
        minSurface,
        maxSurface,
        minRooms,
        maxRooms,
        energyClass,
        hasGarage,
        hasGarden,
        hasPool,
        furnished,
        page,
        limit,
        sortBy,
        order
      } = req.query

      // Build query con filtri validati
      const where = { isActive: true }

      if (minPrice || maxPrice) {
        where.price = {}
        if (minPrice) where.price[Op.gte] = minPrice
        if (maxPrice) where.price[Op.lte] = maxPrice
      }

      if (city) where.city = city
      if (type) where.type = type
      if (status) where.status = status

      // ... altri filtri

      // Esegui query
      const properties = await Property.findAll({
        where,
        limit,
        offset: (page - 1) * limit,
        order: [[sortBy, order.toUpperCase()]]
      })

      res.json({
        data: properties,
        meta: {
          page,
          limit,
          total: properties.length
        }
      })
    } catch (error) {
      console.error('Get properties error:', error)
      res.status(500).json({
        error: 'Errore nel recupero delle proprietà'
      })
    }
  }
)

/**
 * GET /api/properties/:id
 * Dettaglio proprietà con ID validato
 */
router.get(
  '/:id',
  validateIdParam('id'), // ✅ Validazione ID
  async (req, res) => {
    try {
      const { id } = req.params

      const property = await Property.findOne({
        where: { id, isActive: true },
        include: ['images', 'virtualTour']
      })

      if (!property) {
        return res.status(404).json({
          error: 'Proprietà non trovata'
        })
      }

      res.json(property)
    } catch (error) {
      console.error('Get property error:', error)
      res.status(500).json({
        error: 'Errore nel recupero della proprietà'
      })
    }
  }
)

/**
 * POST /api/properties
 * Crea nuova proprietà con validazione completa
 */
router.post(
  '/',
  authenticate,
  authorize(['agent', 'admin']), // Middleware autorizzazione
  validate(createPropertySchema), // ✅ Validazione request body
  async (req, res) => {
    try {
      // I dati sono già validati e sanitizzati
      const propertyData = req.body
      const userId = req.user.id

      // Crea proprietà
      const property = await Property.create({
        ...propertyData,
        createdBy: userId
      })

      // Processa immagini
      if (propertyData.images && propertyData.images.length > 0) {
        // Salva immagini nel database
        await PropertyImage.bulkCreate(
          propertyData.images.map((url, index) => ({
            propertyId: property.id,
            url,
            order: index,
            isThumbnail: index === 0
          }))
        )
      }

      res.status(201).json({
        message: 'Proprietà creata con successo',
        property
      })
    } catch (error) {
      console.error('Create property error:', error)
      res.status(500).json({
        error: 'Errore nella creazione della proprietà'
      })
    }
  }
)

/**
 * PUT /api/properties/:id
 * Aggiorna proprietà con validazione
 */
router.put(
  '/:id',
  authenticate,
  authorize(['agent', 'admin']),
  validateIdParam('id'), // ✅ Validazione ID
  validate(updatePropertySchema), // ✅ Validazione body (parziale)
  async (req, res) => {
    try {
      const { id } = req.params
      const updates = req.body
      const userId = req.user.id

      const property = await Property.findOne({
        where: { id }
      })

      if (!property) {
        return res.status(404).json({
          error: 'Proprietà non trovata'
        })
      }

      // Verifica permessi
      if (property.createdBy !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Non hai i permessi per modificare questa proprietà'
        })
      }

      // Aggiorna proprietà
      await property.update(updates)

      res.json({
        message: 'Proprietà aggiornata con successo',
        property
      })
    } catch (error) {
      console.error('Update property error:', error)
      res.status(500).json({
        error: 'Errore nell\'aggiornamento della proprietà'
      })
    }
  }
)

/**
 * DELETE /api/properties/:id
 * Elimina proprietà con ID validato
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['agent', 'admin']),
  validateIdParam('id'), // ✅ Validazione ID
  async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      const property = await Property.findOne({
        where: { id }
      })

      if (!property) {
        return res.status(404).json({
          error: 'Proprietà non trovata'
        })
      }

      // Verifica permessi
      if (property.createdBy !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Non hai i permessi per eliminare questa proprietà'
        })
      }

      // Soft delete
      await property.update({ isActive: false })

      res.json({
        message: 'Proprietà eliminata con successo'
      })
    } catch (error) {
      console.error('Delete property error:', error)
      res.status(500).json({
        error: 'Errore nell\'eliminazione della proprietà'
      })
    }
  }
)

export default router
