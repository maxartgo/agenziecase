# 🚀 Deployment Strategy - AgenzieCase

**Status**: 🟡 Base | **Priorità**: MEDIA | **Owner**: TBD

---

## 🎯 Obiettivi Deployment

- [ ] Deploy automatizzato via CI/CD
- [ ] Zero downtime deployments
- [ ] Environment separati (dev/staging/prod)
- [ ] Rollback automatico in caso di errore
- [ ] Monitoring e alerts attivi
- [ ] Backup automatizzati

---

## 🏗️ Architettura Deployment

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   GitHub    │──▶   │   CI/CD     │──▶   │  VPS/Cloud  │
│  (Push)     │      │  (Actions)  │      │  (DigitalOcean/AWS) │
└─────────────┘      └─────────────┘      └─────────────┘
                                                  │
                              ┌───────────────────┼───────────────────┐
                              ▼                   ▼                   ▼
                        ┌──────────┐        ┌──────────┐        ┌──────────┐
                        │  Nginx   │        │   PM2    │        │PostgreSQL│
                        │  (Proxy) │        │ (Process │        │ (Database)│
                        └──────────┘        │ Manager) │        └──────────┘
                                            └──────────┘
```

---

## 📋 Piano di Implementazione

### FASE 1: Containerization ⏱️ 3-4 giorni

#### 1.1 Dockerfile - Frontend
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 1.2 Dockerfile - Backend
```dockerfile
# Dockerfile.backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "server/server.js"]
```

#### 1.3 Docker Compose - Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=http://localhost:3001

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: agenziecase
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### FASE 2: CI/CD Pipeline ⏱️ 4-5 giorni

#### 2.1 GitHub Actions - Test & Build
```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test-frontend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Build
        run: npm run build

  test-backend:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./server
        run: npm ci

      - name: Run tests
        working-directory: ./server
        run: npm run test:ci
        env:
          DB_HOST: localhost
          DB_NAME: test_db
          DB_USER: test_user
          DB_PASSWORD: test_password
```

#### 2.2 GitHub Actions - Deploy
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/agenziecase
            git pull origin main
            docker-compose down
            docker-compose up -d --build
            docker-compose exec -T backend npm run migrate
            docker-compose exec -T backend npm run seed

      - name: Health check
        run: |
          sleep 30
          curl -f https://agenziecase.it/api/health || exit 1

      - name: Notify on success
        if: success()
        run: echo "Deploy successful!"

      - name: Notify on failure
        if: failure()
        run: echo "Deploy failed!"
```

### FASE 3: Production Server Setup ⏱️ 5-7 giorni

#### 3.1 Server Requirements
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 2-4 cores
- **RAM**: 4-8 GB
- **Storage**: 40-80 GB SSD
- **Provider**: DigitalOcean / AWS / Hetzner

#### 3.2 Initial Setup
```bash
#!/bin/bash
# scripts/server-setup.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Nginx
sudo apt install nginx -y

# Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Create project directory
sudo mkdir -p /var/www/agenziecase
sudo chown $USER:$USER /var/www/agenziecase
```

#### 3.3 Nginx Configuration
```nginx
# /etc/nginx/sites-available/agenziecase
server {
    listen 80;
    server_name agenziecase.it www.agenziecase.it;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads (increase size limit)
    client_max_body_size 10M;
}
```

#### 3.4 SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d agenziecase.it -d www.agenziecase.it

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

#### 3.5 PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'agenziecase-backend',
      script: './server/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G'
    }
  ],
  deploy: {
    production: {
      user: 'node',
      host: 'agenziecase.it',
      ref: 'origin/main',
      repo: 'git@github.com:username/agenziecase.git',
      path: '/var/www/agenziecase',
      'post-deploy': 'npm install && npm run migrate && pm2 reload ecosystem.config.js --env production'
    }
  }
};
```

### FASE 4: Database Backup ⏱️ 2 giorni

#### 4.1 Automated Backups
```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/agenziecase"
DB_NAME="agenziecase"
DB_USER="postgres"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://agenziecase-backups/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

#### 4.2 Cron Job
```bash
# Add to crontab: crontab -e
# Daily backup at 2 AM
0 2 * * * /var/www/agenziecase/scripts/backup.sh
```

### FASE 5: Monitoring & Logging ⏱️ 2-3 giorni

#### 5.1 PM2 Monitoring
```bash
# Install PM2 Plus (optional)
pm2 plus

# Setup monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### 5.2 Application Logging
```javascript
// server/config/logger.js
const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

#### 5.3 Error Tracking
```javascript
// Sentry integration
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] Tutti i test passano
- [ ] Code linting senza errori
- [ ] Environment variables configurate
- [ ] Database migrations pronte
- [ ] Backup database completo
- [ ] SSL certificate valido
- [ ] Monitoring configurato

### Post-Deployment
- [ ] Health check OK
- [ ] API endpoints funzionanti
- [ ] Frontend caricamento corretto
- [ ] Database queries funzionanti
- [ ] Logs attivi e monitorati
- [ ] Error tracking attivo
- [ ] Performance baseline stabilita

### Rollback Plan
```bash
# Quick rollback script
#!/bin/bash
git revert HEAD
docker-compose down
docker-compose up -d --build
docker-compose exec -T backend npm run migrate:undo
```

---

## 📊 Monitoring Strategy

### Health Checks
```javascript
// server/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok'
  };

  try {
    // Check database
    await sequelize.authenticate();
    health.database = 'connected';

    // Check Redis
    await redisClient.ping();
    health.redis = 'connected';

    res.json(health);
  } catch (error) {
    health.status = 'error';
    health.error = error.message;
    res.status(503).json(health);
  }
});
```

### Performance Monitoring
- [ ] Response time monitoring
- [ ] Database query performance
- [ ] Memory usage tracking
- [ ] CPU usage tracking
- [ ] Disk space monitoring

---

## 🔐 Security in Production

### Firewall Rules
```bash
# UFW rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### SSH Hardening
```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

### Environment Variables
```bash
# Production .env (NEVER commit)
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_NAME=agenziecase_prod
DB_USER=prod_user
DB_PASSWORD=<strong_password>
JWT_SECRET=<strong_jwt_secret>
```

---

## 📚 Risorse

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Performance Tuning](https://www.nginx.com/blog/tuning-nginx/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Let's Encrypt](https://letsencrypt.org/)
