# 🚀 Guida Connessione SSH + Deploy Hetzner

## 📡 CONNESSIONE AL SERVER

### 1. Connessione con Chiave SSH
```bash
# Connessione al server Hetzner
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66

# Prima connessione: rispondi "yes" alla fingerprint verification
# Se richiesto, inserisci la password root fornita da Hetzner
```

### 2. Se la connessione non funziona con la chiave:
```bash
# Prova con password (fornita da Hetzner)
ssh root@178.104.183.66

# Inserisci password root quando richiesto
```

---

## 🛠️ SETUP INIZIALE SERVER (una volta connesso)

### 3. Aggiorna Sistema
```bash
# Aggiorna packages
apt update && apt upgrade -y

# Installa utility base
apt install -y curl wget git vim htop ufw fail2ban

# Set timezone
timedatectl set-timezone Europe/Rome
```

### 4. Configura Firewall
```bash
# Configura UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

### 5. Installa Docker
```bash
# Installa Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installa Docker Compose
apt install -y docker-compose-plugin

# Verifica installazione
docker --version
docker compose version
```

### 6. Installa Nginx
```bash
# Installa Nginx
apt install -y nginx

# Avvia Nginx
systemctl start nginx
systemctl enable nginx
```

### 7. Crea Utente Non-Root
```bash
# Crea utente agenzie
adduser agenzie
usermod -aG sudo,docker agenzie

# Setup SSH per nuovo utente
mkdir -p /home/agenzie/.ssh
cp ~/.ssh/authorized_keys /home/agenzie/.ssh/
chown -R agenzie:agenzie /home/agenzie/.ssh
chmod 700 /home/agenzie/.ssh
chmod 600 /home/agenzie/.ssh/authorized_keys
```

---

## 📦 DEPLOY APPLICAZIONE

### 8. Clona Repository
```bash
# Crea directory progetto
mkdir -p /var/www
cd /var/www

# Clona repository (sostituisci con la tua URL)
git clone https://github.com/tuo-username/agenziecase.git agenziecase
cd agenziecase

# Imposta permessi
chown -R agenzie:agenzie /var/www/agenziecase
```

### 9. Configura Environment
```bash
# Crea environment file
cp .env.production .env

# Modifica con le tue credenziali
vim .env
```

**In .env inserisci:**
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=agenziecase_prod
DB_USER=agenziecase_user
DB_PASSWORD=SOSTITUISCI-CON-PASSWORD-SICURA

# JWT
JWT_SECRET=SOSTITUISCI-CON-SECRET-SICURO
JWT_EXPIRE=7d

# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://TUO-DOMINIO

# API Keys
GROQ_API_KEY=SOSTITUISCI-CON-LA-TUA-KEY
```

### 10. Deploy con Docker
```bash
# Avvia container
docker compose -f docker-compose.hetzner.yml up -d --build

# Verifica container
docker ps

# Controlla logs
docker compose logs -f
```

---

## 🔒 CONFIGURAZIONE SSL

### 11. Installa Certbot
```bash
# Installa Certbot
apt install -y certbot python3-certbot-nginx

# Ferma nginx temporaneamente
systemctl stop nginx
```

### 12. Ottieni Certificati SSL
```bash
# Ottieni certificati (sostituisci con il tuo dominio)
certbot certonly --standalone \
  -d TUO-DOMINIO \
  -d www.TUO-DOMINIO \
  --email TUO-EMAIL \
  --agree-tos \
  --non-interactive
```

### 13. Configura Nginx
```bash
# Crea configurazione nginx
vim /etc/nginx/sites-available/agenziecase
```

**Incolla questa configurazione:**
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name TUO-DOMINIO www.TUO-DOMINIO;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name TUO-DOMINIO www.TUO-DOMINIO;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/TUO-DOMINIO/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/TUO-DOMINIO/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

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

### 14. Abilita Nginx Config
```bash
# Abilita sito
ln -s /etc/nginx/sites-available/agenziecase /etc/nginx/sites-enabled/

# Rimuovi default site
rm /etc/nginx/sites-enabled/default

# Test e riavvia nginx
nginx -t
systemctl start nginx
systemctl enable nginx
```

---

## ✅ VERIFICA DEPLOY

### 15. Test Funzionalità
```bash
# Test health check
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:3000

# Verifica container
docker ps

# Controlla logs
docker compose logs -f backend
```

### 16. Test da Browser
```
1. Apri browser
2. Vai su: http://178.104.183.66
3. Verifica che il sito funzioni
4. Testa https://TUO-DOMINIO
```

---

## 🎉 DEPLOY COMPLETATO!

Il tuo sito è ora live su Hetzner! 🚀

### Accessi:
- **Frontend**: http://178.104.183.66
- **API**: http://178.104.183.66/api
- **SSH**: `ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66`

### Comandi Utili:
```bash
# Restart app
cd /var/www/agenziecase
docker compose restart

# Logs
docker compose logs -f

# Update
git pull origin main
docker compose down
docker compose -f docker-compose.hetzner.yml up -d --build
```

---

## 📞 SUPPORTO

Se hai problemi:
1. Controlla i logs: `docker compose logs -f`
2. Verifica container: `docker ps`
3. Test connessioni: `curl http://localhost:3001/api/health`

**Deploy completato!** 🎊