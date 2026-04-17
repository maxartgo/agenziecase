# 🔒 Security Hardening - AgenzieCase

**Status**: 🔴 Critico | **Priorità**: CRITICA | **Owner**: TBD

---

## 🚨 Vulnerabilità Identificate

### CRITICAL
1. **SQL Injection Risk** - Nessuna sanitizzazione input database
2. **No Rate Limiting** - API vulnerabili a DoS/Brute force
3. **Hardcoded Credentials** - Credenziali in .env file
4. **No Input Validation** - Qualsiasi dato viene accettato

### HIGH
1. **CORS Too Permissive** - Accesso da qualsiasi origine
2. **No XSS Protection** - Vulnerabile a cross-site scripting
3. **No CSRF Protection** - Vulnerabile a cross-site request forgery
4. **Weak Password Policy** - Nessun requisito password

---

## 📋 Piano di Implementazione

### FASE 1: Validazione Input ⏱️ 2-3 giorni

#### 1.1 Setup Zod Validation
```bash
npm install zod
```

#### 1.2 Schemi Validazione
- [ ] **Auth Schemas**
  - [ ] Registration validation
  - [ ] Login validation
  - [ ] Password reset validation
  - [ ] Password requirements (min 8 char, maiuscola, numero, speciale)

- [ ] **Property Schemas**
  - [ ] Create property validation
  - [ ] Update property validation
  - [ ] Filter validation

- [ ] **CRM Schemas**
  - [ ] Client validation
  - [ ] Appointment validation
  - [ ] Deal validation
  - [ ] Activity validation

#### 1.3 Implementazione Middleware
```javascript
// middleware/validate.js
const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.errors });
  }
};
```

### FASE 2: Rate Limiting ⏱️ 1-2 giorni

#### 2.1 Setup Express Rate Limit
```bash
npm install express-rate-limit
```

#### 2.2 Configurazione Limiti
- [ ] **Auth endpoints** - 5 req/15min
- [ ] **API general** - 100 req/15min
- [ ] **Search endpoints** - 20 req/min
- [ ] **Upload endpoints** - 10 req/ora

#### 2.3 Implementazione
```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5,
  message: 'Too many attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
```

### FASE 3: SQL Injection Prevention ⏱️ 2-3 giorni

#### 3.1 Sequelize Parameterized Queries
- [ ] Review tutte le query
- [ ] Assicurarsi che usano parameterized queries
- [ ] Niente query concatenation
- [ ] Usare `Sequelize.escape()` dove necessario

#### 3.2 Input Sanitization
```javascript
// middleware/sanitize.js
const sanitizeHtml = require('sanitize-html');

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Sanitize string fields
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    });
  }
  next();
};
```

#### 3.3 XSS Protection
```bash
npm install xss-clean helmet
```

```javascript
// server.js
const helmet = require('helmet');
const xssClean = require('xss-clean');

app.use(helmet());
app.use(xssClean());
```

### FASE 4: CORS Configuration ⏱️ 1 giorno

#### 4.1 CORS Restrictive
```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://agenziecase.it',
      'https://www.agenziecase.it'
    ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### FASE 5: Environment Variables ⏱️ 1 giorno

#### 5.1 Setup .env.example
```bash
# .env.example - DA NON COMMITTARE
NODE_ENV=development
PORT=3001

# Database
DB_NAME=agenziecase
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

# API Keys
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_CLOUD_KEY=your_google_key

# Email
EMAIL_HOST=smtp.ovh.net
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@agenziecase.it

# Cloudinary (opzionale)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (opzionale)
REDIS_URL=redis://localhost:6379
```

#### 5.2 Validation Script
```javascript
// config/envValidation.js
const requiredEnvVars = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'ANTHROPIC_API_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### FASE 6: Authentication Security ⏱️ 2-3 giorni

#### 6.1 JWT Best Practices
- [ ] Secret key minimo 32 caratteri
- [ ] Short expiration (7 days max)
- [ ] Refresh token implementation
- [ ] Token rotation
- [ ] Blacklist per logout

#### 6.2 Password Hashing
```javascript
// Usare bcrypt con alto work factor
const bcrypt = require('bcrypt');
const saltRounds = 12; // Aumentato da 10

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};
```

#### 6.3 Password Policy
```javascript
// Zod schema per password
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');
```

### FASE 7: CSRF Protection ⏱️ 1-2 giorni

```bash
npm install csurf
```

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Send CSRF token to frontend
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### FASE 8: File Upload Security ⏱️ 2 giorni

#### 8.1 Multer Configuration
```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
```

### FASE 9: Logging & Monitoring Security ⏱️ 2 giorni

#### 9.1 Security Event Logging
- [ ] Login attempts (success/fail)
- [ ] Failed validations
- [ ] Rate limit hits
- [ ] Suspicious activity
- [ ] File uploads

```javascript
// middleware/securityLogger.js
const logSecurityEvent = (eventType, details) => {
  console.log({
    timestamp: new Date().toISOString(),
    type: 'SECURITY',
    event: eventType,
    ...details
  });
};
```

### FASE 10: Security Headers ⏱️ 1 giorno

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
}));
```

---

## 🎯 Milestone Sicurezza

### Milestone 1: Base Protection (Week 1)
- [ ] Input validation completa
- [ ] Rate limiting attivo
- [ ] CORS configurato
- [ ] Environment variables validate

### Milestone 2: Advanced Protection (Week 2)
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Upload security

### Milestone 3: Monitoring (Week 3)
- [ ] Security logging
- [ ] Event tracking
- [ ] Alert configuration
- [ ] Security audit

---

## 📊 Security Checklist

- [ ] Tutti gli input validati
- [ ] Tutte le query parameterized
- [ ] Rate limiting su tutte le API
- [ ] CORS restrittivo
- [ ] Helmet security headers
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Strong password policy
- [ ] JWT con breve expiration
- [ ] File upload validation
- [ ] Environment variables validate
- [ ] Security logging
- [ ] HTTPS only in production
- [ ] Database encryption at rest
- [ ] Regular security audits

---

## 🔗 Script Utili

### Security Check Script
```bash
#!/bin/bash
# scripts/security-check.sh

echo "🔒 Running Security Checks..."

# Check for hardcoded secrets
echo "Checking for hardcoded secrets..."
git grep -i "password\|secret\|api_key" -- ':!.env.example' || echo "No secrets found"

# Check for console.log in production
echo "Checking for console.log..."
git grep "console.log" -- ':!node_modules' || echo "No console.log found"

# Check for TODO/FIXME
echo "Checking for security TODOs..."
git grep -i "todo.*security\|fixme.*security" || echo "No security TODOs found"

echo "✅ Security check complete"
```

---

## 📚 Risorse

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://github.com/lirantal/nodejs-security-best-practices)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
