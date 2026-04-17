// server/middleware/rate-limit/authLimiter.js
import rateLimit from 'express-rate-limit'

/**
 * Rate Limiter per Auth Endpoints
 * Protegge da brute force attacks su login/registro
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // Massimo 5 tentativi per finestra
  message: {
    error: 'Troppi tentativi. Riprova tra 15 minuti.',
    retryAfter: '15 minuti'
  },
  standardHeaders: true, // Ritorna header `RateLimit-*`
  legacyHeaders: false, // Disabilita `X-RateLimit-*`
  skipSuccessfulRequests: false, // Conta anche richieste riuscite
  keyGenerator: (req) => {
    // Usa IP come chiave, ma fallback su email se disponibile
    return req.body?.email || req.ip || 'unknown'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Troppi tentativi di autenticazione',
      message: 'Troppi tentativi. Riprova tra 15 minuti.',
      retryAfter: 900 // 15 minuti in secondi
    })
  }
})

/**
 * Rate Limiter per Password Reset
 * Ancora più restrittivo
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 3, // Massimo 3 richieste per ora
  message: {
    error: 'Troppe richieste di reset password',
    retryAfter: '1 ora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Troppe richieste di reset password',
      message: 'Riprova tra 1 ora',
      retryAfter: 3600 // 1 ora in secondi
    })
  }
})
