// server/middleware/rate-limit/uploadLimiter.js
import rateLimit from 'express-rate-limit'

/**
 * Rate Limiter per Upload Endpoints
 * Molto restrittivo - gli upload consumano molte risorse
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 10, // 10 upload per ora
  message: {
    error: 'Troppi upload',
    retryAfter: '1 ora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // Conta anche richieste fallite
  handler: (req, res) => {
    res.status(429).json({
      error: 'Troppi upload',
      message: 'Hai superato il limite di upload. Riprova tra 1 ora.',
      retryAfter: 3600 // 1 ora in secondi
    })
  }
})

/**
 * Rate Limiter per Virtual Tour Upload
 * Ancora più restrittivo
 */
export const virtualTourLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 ore
  max: 3, // 3 virtual tour upload per giorno
  message: {
    error: 'Troppi upload virtual tour',
    retryAfter: '24 ore'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Troppi upload virtual tour',
      message: 'Hai superato il limite di upload virtual tour. Riprova tra 24 ore.',
      retryAfter: 86400 // 24 ore in secondi
    })
  }
})
