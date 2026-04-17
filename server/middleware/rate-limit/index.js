// server/middleware/rate-limit/index.js
/**
 * Centralizzato per tutti i rate limiters
 */
export { authLimiter, passwordResetLimiter } from './authLimiter.js'
export { apiLimiter, searchLimiter, aiLimiter } from './apiLimiter.js'
export { uploadLimiter, virtualTourLimiter } from './uploadLimiter.js'

/**
 * Configurazione Rate Limiting per Tutte le Routes
 *
 * Uso raccomandato:
 *
 * 1. Auth routes (login/register): 5 req/15min
 *    router.use('/auth', authLimiter)
 *
 * 2. API general: 100 req/15min
 *    router.use('/api', apiLimiter)
 *
 * 3. Search: 20 req/min
 *    router.use('/api/search', searchLimiter)
 *
 * 4. AI endpoints: 10 req/min
 *    router.use('/api/ai', aiLimiter)
 *
 * 5. Upload: 10 req/ora
 *    router.use('/api/upload', uploadLimiter)
 *
 * 6. Virtual tour: 3 req/giorno
 *    router.use('/api/virtual-tour', virtualTourLimiter)
 *
 * 7. Password reset: 3 req/ora
 *    router.post('/reset-password', passwordResetLimiter)
 */
