#!/bin/bash
# 🚀 Install Real Let's Encrypt SSL Certificate

set -e

echo "🔒 INSTALLAZIONE CERTIFICATI LET'S ENCRYPT REALI"
echo "=============================================="
echo ""

SSH_KEY="$HOME/.ssh/agenziecase_hetzner"
SERVER_IP="178.104.183.66"

echo "📡 Connessione al server..."
ssh -i "$SSH_KEY" root@$SERVER_IP << 'EOF'
echo "✅ Connessione riuscita!"
echo ""

# Stop frontend container temporarily
echo "🛑 Fermo container frontend..."
docker stop agenziecase-frontend

# Obtain real Let's Encrypt certificate
echo "🔑 Richiesta certificati Let's Encrypt..."
certbot certonly --standalone \
  -d agenziecase.com \
  -d www.agenziecase.com \
  --email admin@agenziecase.com \
  --agree-tos \
  --non-interactive \
  --keep-until-expiring

# Verify certificates
echo "🔍 Verifica certificati..."
certbot certificates

# Test renewal
echo "🧪 Test rinnovo automatico..."
certbot renew --dry-run

# Update nginx configuration
echo "⚙️ Aggiornamento configurazione nginx..."
cd /var/www/agenziecase

# Create new nginx config with Let's Encrypt paths
cat > nginx-ssl.conf << 'NGINX'
# HTTP to HTTPS redirect server
server {
    listen 80;
    server_name agenziecase.com www.agenziecase.com;

    # Allow Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS main server
server {
    listen 443 ssl http2;
    server_name agenziecase.com www.agenziecase.com;

    root /usr/share/nginx/html;
    index index.html;

    # SSL Certificate Configuration
    ssl_certificate /etc/letsencrypt/live/agenziecase.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agenziecase.com/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https:; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # API proxy to backend
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers if needed
        add_header Access-Control-Allow-Origin https://agenziecase.com always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Serve static files with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint (no logging)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Security: Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINX

echo "✅ Configurazione nginx aggiornata!"
echo ""

# Update docker-compose to use Let's Encrypt certificates
cat > docker-compose.production.yml << 'COMPOSE'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: agenziecase-postgres
    environment:
      POSTGRES_USER: agenziecase_user
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: agenziecase_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agenziecase_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: agenziecase-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: agenziecase-backend
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: agenziecase_prod
      DB_USER: agenziecase_user
      DB_PASSWORD: \${DB_PASSWORD}
      JWT_SECRET: \${JWT_SECRET}
      JWT_EXPIRE: 7d
      GROQ_API_KEY: \${GROQ_API_KEY}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      FRONTEND_URL: \${FRONTEND_URL}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: agenziecase-frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "https://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  default:
    name: agenziecase_agenziecase-network
COMPOSE

echo "✅ Docker compose aggiornato!"
echo ""

# Rebuild and restart frontend
echo "🐳 Riavvio frontend con nuova configurazione..."
docker stop agenziecase-frontend
docker rm agenziecase-frontend
docker build -f Dockerfile.frontend -t agenziecase-frontend .
docker run -d --name agenziecase-frontend \
  --network agenziecase_agenziecase-network \
  -p 80:80 -p 443:443 \
  -v /var/www/agenziecase/nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  --restart unless-stopped \
  agenziecase-frontend

echo "✅ Frontend riavviato!"
echo ""

# Enable auto-renewal
echo "⚙️ Configurazione auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "🎉 CERTIFICATI LET'S ENCRYPT INSTALLATI!"
echo ""
echo "📋 Certificati:"
certbot certificates

echo ""
echo "🕐 Timer auto-renewal:"
systemctl list-timers | grep certbot

EOF

echo ""
echo "🎉 INSTALLAZIONE COMPLETATA!"
echo ""
echo "🔥 VERIFICA HTTPS:"
echo "   curl -I https://agenziecase.com"
echo ""
echo "🌐 Test nel browser:"
echo "   https://agenziecase.com"
echo ""