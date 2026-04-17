// Security Middleware Configuration
import helmet from 'helmet';
import cors from 'cors';

/**
 * CORS Configuration - Restrictive
 * Solo origini consentite per produzione
 */
export const corsOptions = {
  origin: function (origin, callback) {
    // Lista origini consentite
    const allowedOrigins = [
      'http://localhost:5173',      // Vite dev server
      'http://localhost:3000',      // Alternativo dev server
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];

    // In produzione, aggiungere domini reali
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(
        'https://agenziecase.it',
        'https://www.agenziecase.it'
      );
    }

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,              // Abilita cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],     // Header personalizzati esposti
  maxAge: 600                            // Cache preflight per 10 minuti
};

/**
 * Helmet Configuration - Security Headers
 * Protezione da XSS, clickjacking, MIME sniffing, etc.
 */
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Unsafe per development
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.groq.com", "https://*.anthropic.com"],
      mediaSrc: ["'self'", "https:", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: null
    }
  },
  hsts: {
    maxAge: 31536000,          // 1 anno
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,               // Protezione da MIME sniffing
  xssFilter: true,             // Protezione XSS
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      geolocation: ["'none'"],
      microphone: ["'none'"]
    }
  }
};

/**
 * Development CSP - Più permissiva per sviluppo
 */
export const helmetConfigDev = {
  contentSecurityPolicy: false,  // Disabilita CSP in sviluppo
  hsts: false                    // Disabilita HSTS in sviluppo
};

/**
 * Export middleware configurati
 */
export const setupSecurity = (app) => {
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet(helmetConfig));
  } else {
    // In sviluppo usa configurazione più permissiva
    app.use(helmet(helmetConfigDev));
    console.warn('⚠️  Security headers in modalità development');
  }

  app.use(cors(corsOptions));
};

/**
 * Rate Limiting Check
 * Verifica se una richiesta dovrebbe essere rate limited
 */
export const checkRateLimit = (req, res, next) => {
  const userAgent = req.get('user-agent') || '';

  // Blocca user agent sospetti
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Automated requests are not allowed'
    });
  }

  next();
};

/**
 * Security Headers Custom
 * Aggiunge headers di sicurezza personalizzati
 */
export const customSecurityHeaders = (req, res, next) => {
  // Rimuovi header che rivelano informazioni sul server
  res.removeHeader('X-Powered-By');

  // Aggiungi header personalizzati
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
};
