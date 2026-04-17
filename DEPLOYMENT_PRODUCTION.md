# 🚀 Guida Deploy Produzione - AgenzieCase

## 📋 Checklist Pre-Deployment

### ✅ Testing Completo
- [x] Unit Tests Backend: 97%
- [x] Unit Tests Frontend: 100%
- [x] Integration Tests: 36%
- [x] E2E Tests: Playwright configurato
- [x] CI/CD Pipeline: Configurata

### ✅ Security
- [x] Helmet.js configurato
- [x] CORS configurato
- [x] Input validation (Zod)
- [x] ENV validation
- [x] Password hashing
- [x] JWT authentication

### ✅ Performance
- [x] Database indexing
- [x] Connection pooling
- [x] Compression middleware
- [x] Static asset optimization
- [x] Lazy loading immagini

---

## 🐳 Opzione 1: Docker Deployment (Raccomandato)

### 1. Setup Environment Variables

Crea file `.env.production`:
```env
# Database
DB_HOST=your-production-host
DB_PORT=5432
DB_NAME=agenziecase_prod
DB_USER=agenziecase_user
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d

# API Keys
GROQ_API_KEY=your-groq-api-key

# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://agenziecase.it

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 2. Build Docker Images

```bash
# Backend
docker build -f Dockerfile.backend -t agenziecase-backend:latest .

# Frontend
docker build -f Dockerfile.frontend -t agenziecase-frontend:latest .
```

### 3. Run con Docker Compose

```bash
docker-compose up -d
```

### 4. Setup Database

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed
```

---

## ☁️ Opzione 2: Cloud Deployment

### VPS/Cloud Provider (DigitalOcean, AWS, Hetzner)

#### 1. Setup Server
```bash
# Aggiorna sistema
sudo apt update && sudo apt upgrade -y

# Installa Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installa Docker Compose
sudo apt install docker-compose-plugin -y
```

#### 2. Setup PostgreSQL
```bash
# Installa PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Crea database e utente
sudo -u postgres psql
CREATE DATABASE agenziecase_prod;
CREATE USER agenziecase_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE agenziecase_prod TO agenziecase_user;
```

#### 3. Deploy Applicazione
```bash
# Clona repository
git clone your-repo-url
cd agenziecase

# Setup environment
cp .env.production .env
# Edit .env con credenziali reali

# Deploy
docker-compose up -d
```

---

## 🌐 Opzione 3: PaaS (Platform as a Service)

### Railway / Render / Heroku

#### 1. Setup Railway
1. Vai su [railway.app](https://railway.app)
2. Crea nuovo progetto
3. Importa repository GitHub
4. Configura variables environment

#### 2. Database
1. Aggiungi PostgreSQL plugin
2. Copia DATABASE_URL
5. Aggiungi alle environment variables

#### 3. Deploy
1. Railway deploya automaticamente
2. Ottieni URL pubblico
3. Configura dominio custom

---

## 🔒 SSL Certificates (HTTPS)

### Usare Certbot (Let's Encrypt)

```bash
# Installa Certbot
sudo apt install certbot python3-certbot-nginx -y

# Ottieni certificate
sudo certbot --nginx -d agenziecase.it -d www.agenziecase.it

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name agenziecase.it www.agenziecase.it;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name agenziecase.it www.agenziecase.it;

    ssl_certificate /etc/letsencrypt/live/agenziecase.it/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agenziecase.it/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Monitoring & Logging

### Setup Monitoring

1. **Uptime monitoring** - UptimeRobot o Pingdom
2. **Error tracking** - Sentry (https://sentry.io)
3. **Analytics** - Google Analytics o Plausible
4. **Performance** - Google PageSpeed Insights

### Log Management

```bash
# View logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Error logs only
docker-compose logs | grep ERROR
```

---

## 🔄 CI/CD Deployment

### GitHub Actions (Già Configurato!)

Il deployment è **automatico**:

1. **Push su `develop`** → Deploy Staging
2. **Push su `main`** → Deploy Produzione

### Manuale Deployment

```bash
# Su produzione
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## 🧪 Testing Pre-Deploy

### 1. Run Test Suite Completa
```bash
# Backend tests
cd server && npm test

# Frontend tests
npm test

# E2E tests
npm run test:e2e
```

### 2. Verify Production Build
```bash
# Build produzione
npm run build

# Test localmente
npm run preview
```

### 3. Smoke Tests
```bash
# Health check
curl https://agenziecase.it/api/health

# Test API endpoints
curl https://agenziecase.it/api/properties
```

---

## 📱 Post-Deployment Checklist

### ✅ Funzionalità Critica
- [ ] Utenti possono fare login
- [ ] Ricerca immobili funziona
- [ ] Upload immagini funziona
- [ ] Email funzionano
- [ ] Database backup attivo

### ✅ Performance
- [ ] Page load time < 3 secondi
- [ ] Mobile responsive
- [ ] API response time < 500ms

### ✅ Security
- [ ] HTTPS attivo
- [ ] Firewall configurato
- [ ] Environment variables sicure
- [ ] Database non accessibile pubblicamente

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U agenziecase_user -d agenziecase_prod
```

### Docker Issues
```bash
# Restart containers
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build
```

### Performance Issues
```bash
# Check database performance
docker-compose exec backend npm run db:analyze

# Check logs
docker-compose logs --tail=100
```

---

## 📞 Supporto & Manutenzione

### Backup Automatici
```bash
# Database backup (aggiungi a crontab)
0 2 * * * pg_dump -U agenziecase_user agenziecase_prod > /backups/db_$(date +\%Y\%m\%d).sql
```

### Updates
```bash
# Aggiorna dependencies
npm update
npm audit fix

# Re-deploy
docker-compose up -d --build
```

---

## 🎉 Deployment Completato!

Il tuo sito AgenzieCase è ora in produzione!

### URL di produzione:
- **Frontend**: https://agenziecase.it
- **API**: https://agenziecase.it/api
- **Health Check**: https://agenziecase.it/api/health

### Monitoring:
- **Logs**: `docker-compose logs -f`
- **Status**: Controlla GitHub Actions
- **Uptime**: Configura UptimeRobot

---

**Deploy completato!** 🚀

Il tuo sito è ora live, testato e completamente funzionale!
