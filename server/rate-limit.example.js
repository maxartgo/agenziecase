// server/rate-limit.example.js
// ESEMPIO: Come applicare rate limiting al server Express

import express from 'express'
import {
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
  searchLimiter,
  aiLimiter,
  uploadLimiter,
  virtualTourLimiter
} from './middleware/rate-limit/index.js'

const app = express()

// ============================================================
// 1. APPLICA RATE LIMITING GLOBALE
// ============================================================
app.use('/api', apiLimiter)

// ============================================================
// 2. AUTH ROUTES - PROTEZIONE BRUTE FORCE
// ============================================================
// Login e registrazione hanno limiti molto stretti
app.post('/api/auth/login', authLimiter, loginHandler)
app.post('/api/auth/register', authLimiter, registerHandler)

// Password reset ancora più restrittivo
app.post('/api/auth/forgot-password', passwordResetLimiter, forgotPasswordHandler)
app.post('/api/auth/reset-password', passwordResetLimiter, resetPasswordHandler)

// ============================================================
// 3. SEARCH ROUTES - PREVIENI ABUSO RICERCA
// ============================================================
app.get('/api/search', searchLimiter, searchHandler)
app.get('/api/properties', searchLimiter, propertySearchHandler)

// ============================================================
// 4. AI ENDPOINTS - LIMITA COSTI API
// ============================================================
app.post('/api/chat', aiLimiter, chatHandler)
app.post('/api/search-ai', aiLimiter, aiSearchHandler)

// ============================================================
// 5. UPLOAD ROUTES - LIMITA CARICO SERVER
// ============================================================
app.post('/api/upload', uploadLimiter, uploadHandler)
app.post('/api/properties/:id/images', uploadLimiter, propertyImageUploadHandler)

// Virtual tour upload molto restrittivo
app.post('/api/virtual-tour/upload', virtualTourLimiter, virtualTourUploadHandler)

// ============================================================
// 6. ADMIN ROUTES - LIMITI SEPARATI PER ADMIN
// ============================================================
// Potresti voler limiti diversi per admin
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Limiti più alti per admin
})

app.use('/api/admin', adminLimiter)

// ============================================================
// 7. SKIP RATE LIMITING PER HEALTH CHECK
// ============================================================
// Il rate limiter generico skip già health check, ma puoi
// anche definire rotte senza rate limiting
app.get('/health', healthCheckHandler) // Nessun rate limiting

// ============================================================
// 8. CUSTOM RATE LIMITING PER UTENTE
// ============================================================
// Per utenti premium, potresti voler limiti più alti
export const premiumUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // 5x più alto
  skip: (req) => {
    // Skip per utenti premium
    return req.user?.isPremium === true
  }
})

app.use('/api/premium', premiumUserLimiter)

// ============================================================
// ESEMPIO HANDLER
// ============================================================
function loginHandler(req, res) {
  // Auth logic
  res.json({ message: 'Login successful' })
}

function searchHandler(req, res) {
  // Search logic
  res.json({ results: [] })
}

// ecc...

export default app

// ============================================================
// TESTING RATE LIMITING
// ============================================================
/*
# Test 1: Login rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Dopo 5 tentativi, riceverai 429 (Too Many Requests)

# Test 2: API rate limiting
for i in {1..150}; do
  curl http://localhost:3001/api/properties
done
# Dopo 100 richieste, riceverai 429

# Test 3: Search rate limiting
for i in {1..30}; do
  curl "http://localhost:3001/api/search?q=test"
done
# Dopo 20 richieste, riceverai 429
*/
