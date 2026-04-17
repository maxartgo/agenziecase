// server/middleware/rate-limit/apiLimiter.js
import rateLimit from 'express-rate-limit'

/**
 * Rate Limiter Generico per API
 * Protegge da abuso generale delle API
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // 100 richieste per 15 minuti
  message: {
    error: 'Troppe richieste',
    retryAfter: '15 minuti'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting per health check
    return req.path === '/api/health' || req.path === '/health'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Troppe richieste API',
      message: 'Hai superato il limite di richieste. Riprova tra 15 minuti.',
      retryAfter: 900 // 15 minuti in secondi
    })
  }
})

/**
 * Rate Limiter per Search Endpoints
 * Più restrittivo per prevenire abuso ricerca
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20, // 20 ricerche per minuto
  message: {
    error: 'Troppe ricerche',
    retryAfter: '1 minuto'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Troppe ricerche',
      message: 'Hai superato il limite di ricerche. Riprova tra 1 minuto.',
      retryAfter: 60 // 1 minuto in secondi
    })
  }
})

/**
 * Rate Limiter per AI Endpoints
 * Molto restrittivo - le chiamate AI sono costose
 */
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 chiamate AI per minuto
  message: {
    error: 'Troppe chiamate AI',
    retryAfter: '1 minuto'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Troppe chiamate AI',
      message: 'Hai superato il limite di chiamate AI. Riprova tra 1 minuto.',
      retryAfter: 60 // 1 minuto in secondi
    })
  }
})
