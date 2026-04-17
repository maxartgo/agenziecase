# ⚡ Performance Optimization - AgenzieCase

**Status**: 🟡 Parziale | **Priorità**: ALTA | **Owner**: TBD

---

## 📊 Performance Baseline

### Frontend
- Initial Load: TBD
- Time to Interactive: TBD
- Bundle Size: TBD
- Lighthouse Score: TBD

### Backend
- API Response Time: TBD
- Database Query Time: TBD
- Requests/sec capability: TBD
- Memory Usage: TBD

---

## 📋 Piano di Implementazione

### FASE 1: Database Optimization ⏱️ 3-4 giorni

#### 1.1 Analyze Query Performance
```javascript
// Abilita query logging in development
const sequelize = new Sequelize(..., {
  logging: (query, timing) => {
    if (timing > 100) {
      console.log(`SLOW QUERY (${timing}ms):`, query);
    }
  }
});
```

#### 1.2 Add Database Indexes
```javascript
// Models con indexes
// Property indexes
Property.init({
  // ...fields
}, {
  indexes: [
    {
      name: 'properties_price_city',
      fields: ['price', 'city']
    },
    {
      name: 'properties_active',
      fields: ['isActive']
    },
    {
      name: 'properties_created_at',
      fields: ['createdAt']
    }
  ]
});

// Client indexes
Client.init({
  // ...fields
}, {
  indexes: [
    {
      name: 'clients_agent_email',
      fields: ['agentId', 'email']
    },
    {
      name: 'clients_status',
      fields: ['status']
    }
  ]
});
```

#### 1.3 Fix N+1 Queries
```javascript
// PRIMA (N+1 queries)
const properties = await Property.findAll();
for (const property of properties) {
  const images = await property.getImages(); // N queries
}

// DOPO (1 query con eager loading)
const properties = await Property.findAll({
  include: [{
    model: Image,
    as: 'images'
  }]
});
```

#### 1.4 Connection Pooling
```javascript
const sequelize = new Sequelize({
  // ...config
  pool: {
    max: 20, // Massimo connessioni
    min: 5,  // Minimo connessioni
    acquire: 30000, // Max tempo per ottenere connessione (ms)
    idle: 10000 // Max tempo connessione idle (ms)
  }
});
```

### FASE 2: Caching Strategy ⏱️ 3-4 giorni

#### 2.1 Setup Redis
```bash
npm install redis
```

#### 2.2 Redis Configuration
```javascript
// config/redis.js
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

client.connect();
module.exports = client;
```

#### 2.3 Cache Middleware
```javascript
// middleware/cache.js
const redisClient = require('../config/redis');
const crypto = require('crypto');

const cache = (duration = 300) => {
  return async (req, res, next) => {
    const key = crypto
      .createHash('md5')
      .update(req.originalUrl + JSON.stringify(req.query))
      .digest('hex');

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Override res.json to cache response
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redisClient.setEx(key, duration, JSON.stringify(data));
        return originalJson(data);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = cache;
```

#### 2.4 Cache Implementation
```javascript
// Usage in routes
const cache = require('../middleware/cache');

// Cache per 5 minuti
router.get('/api/properties', cache(300), async (req, res) => {
  const properties = await Property.findAll({
    where: req.query
  });
  res.json(properties);
});
```

#### 2.5 Cache Invalidation
```javascript
// Invalidate cache on updates
const invalidateCache = async (pattern) => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

// After property update
await property.update(req.body);
await invalidateCache('property:*');
```

### FASE 3: Frontend Optimization ⏱️ 3-4 giorni

#### 3.1 Code Splitting
```javascript
// Lazy loading routes
const CRMDashboard = lazy(() => import('./components/CRMDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/crm" element={<CRMDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
}
```

#### 3.2 Component Lazy Loading
```javascript
// Per componenti pesanti
const PropertyCreateModal = lazy(() => import('./components/PropertyCreateModal'));

// Usage
{showModal && (
  <Suspense fallback={<ModalLoader />}>
    <PropertyCreateModal onClose={handleClose} />
  </Suspense>
)}
```

#### 3.3 Image Optimization
```javascript
// Image component lazy loading
const LazyImage = ({ src, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      });
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} src={imageSrc || ''} alt={alt} {...props} />;
};
```

#### 3.4 Bundle Analysis
```bash
npm install --save-dev rollup-plugin-visualizer
```

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true
    })
  ]
};
```

#### 3.5 Memoization
```javascript
// Usa React.memo per componenti costosi
export const PropertyCard = React.memo(({ property }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.property.id === nextProps.property.id;
});

// Usa useMemo per calcoli pesanti
const filteredProperties = useMemo(() => {
  return properties.filter(p => p.price <= maxPrice);
}, [properties, maxPrice]);

// Usa useCallback per callbacks
const handleClick = useCallback(() => {
  onPropertyClick(property.id);
}, [property.id, onPropertyClick]);
```

### FASE 4: API Optimization ⏱️ 2-3 giorni

#### 4.1 Pagination
```javascript
// Implementa pagination su tutti gli endpoint
router.get('/api/properties', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const { count, rows } = await Property.findAndCountAll({
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  });

  res.json({
    data: rows,
    meta: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  });
});
```

#### 4.2 Select Fields
```javascript
// Ritorna solo campi necessari
router.get('/api/properties', async (req, res) => {
  const properties = await Property.findAll({
    attributes: ['id', 'title', 'price', 'city', 'images'],
    include: [
      { model: Image, attributes: ['url', 'thumbnail'] }
    ]
  });
  res.json(properties);
});
```

#### 4.3 Compression
```javascript
const compression = require('compression');

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024 // Only compress if > 1KB
}));
```

### FASE 5: CDN Implementation ⏱️ 2-3 giorni

#### 5.1 Static Assets CDN
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
};
```

#### 5.2 Image CDN
```javascript
// Usa Cloudinary o simili
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload con ottimizzazione automatica
const uploadImage = async (file) => {
  return await cloudinary.uploader.upload(file, {
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 800, crop: 'limit' }
    ]
  });
};
```

---

## 🎯 Target Performance

### Frontend
- Initial Load: < 2s
- Time to Interactive: < 3s
- Bundle Size: < 500KB (gzipped)
- Lighthouse Score: > 90

### Backend
- API Response Time (p50): < 100ms
- API Response Time (p95): < 500ms
- Database Query Time: < 50ms
- Requests/sec: > 1000

### Cache
- Hit Rate: > 80%
- Redis Memory: < 1GB
- Cache Duration: 5-15 min

---

## 📊 Performance Monitoring

### Setup Monitoring
```javascript
// middleware/performance.js
const perfLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(`SLOW REQUEST: ${req.method} ${req.path} - ${duration}ms`);
    }
  });

  next();
};

app.use(perfLogger);
```

### Database Query Monitoring
```javascript
// Log slow queries
sequelize.authenticate().then(() => {
  sequelize.query('SET log_min_duration_statement = 100');
});
```

---

## 🔧 Performance Testing

### Load Testing con k6
```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up
    { duration: '1m', target: 100 },   // Stay at 100
    { duration: '30s', target: 200 }, // Ramp up to 200
    { duration: '1m', target: 200 },   // Stay at 200
    { duration: '30s', target: 0 },    // Ramp down
  ],
};

export default function () {
  let res = http.get('http://localhost:3001/api/properties');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 📝 Performance Checklist

### Database
- [ ] Indici aggiunti su colonne frequentemente queryate
- [ ] N+1 queries eliminate
- [ ] Connection pooling configurato
- [ ] Slow query logging attivo
- [ ] Database backup automatizzato

### Caching
- [ ] Redis configurato
- [ ] Cache su endpoints frequenti
- [ ] Cache invalidation strategy
- [ ] Session storage in Redis
- [ ] Cache hit rate monitorato

### Frontend
- [ ] Code splitting implementato
- [ ] Lazy loading componenti
- [ ] Image optimization
- [ ] Bundle analysis completato
- [ ] Memoization applicata

### API
- [ ] Pagination su tutti gli endpoint
- [ ] Select fields dove necessario
- [ ] Compression abilitata
- [ ] Rate limiting configurato
- [ ] CORS ottimizzato

### Monitoring
- [ ] Performance logging attivo
- [ ] APM tool configurato (New Relic / DataDog)
- [ ] Alerts per performance degradation
- [ ] Regular performance audits

---

## 🔗 Script Utili

```bash
#!/bin/bash
# scripts/performance-check.sh

echo "⚡ Running Performance Checks..."

# Bundle size check
echo "Checking bundle size..."
npm run build

# Database query performance
echo "Analyzing database queries..."
npm run analyze-queries

# Cache hit rate
echo "Checking cache hit rate..."
redis-cli INFO stats | grep keyspace

echo "✅ Performance check complete"
```

---

## 📚 Risorse

- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Web.dev Performance](https://web.dev/performance/)
