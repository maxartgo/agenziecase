import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getPropertyStats
} from '../controllers/propertyController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { cacheMiddleware, cacheTTL, cacheInvalidators } from '../middleware/cache.js';

const router = express.Router();

// Routes pubbliche con cache
router.get('/', cacheMiddleware(cacheTTL.MEDIUM), getAllProperties);                    // 5 min cache
router.get('/featured', cacheMiddleware(cacheTTL.LONG), getFeaturedProperties);         // 10 min cache
router.get('/stats', cacheMiddleware(cacheTTL.VERY_LONG), getPropertyStats);            // 15 min cache
router.get('/:id', cacheMiddleware(cacheTTL.MEDIUM), getPropertyById);                  // 5 min cache

// Routes protette - Solo partner e admin possono gestire immobili
router.post('/', authenticateToken, authorizeRoles('partner', 'admin'), createProperty);
router.put('/:id', authenticateToken, authorizeRoles('partner', 'admin'), updateProperty);
router.patch('/:id', authenticateToken, authorizeRoles('partner', 'admin'), updateProperty);
router.delete('/:id', authenticateToken, authorizeRoles('partner', 'admin'), deleteProperty);

export default router;
