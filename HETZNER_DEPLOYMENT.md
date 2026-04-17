# 🚀 Deploy Produzione su Hetzner - Guida Completa

## 📋 INDEX

1. [Setup Account Hetzner](#1-setup-account-hetzner)
2. [Creazione Server Cloud](#2-creazione-server-cloud)
3. [Configurazione DNS](#3-configurazione-dns)
4. [Setup Server](#4-setup-server)
5. [Deploy Applicazione](#5-deploy-applicazione)
6. [Configurazione SSL](#6-configurazione-ssl)
7. [Monitoring & Backup](#7-monitoring--backup)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. SETUP ACCOUNT HETZNER

### 1.1 Registrazione
1. Vai su [hetzner.com](https://www.hetzner.com)
2. Crea un account (email + password)
3. Verifica email
4. Aggiungi metodo di pagamento (carta di credito/PayPal)

### 1.3 Prezzi (2026)
- **CX22** (4GB RAM, 2 vCPU, 40GB NVMe): **€4.23/mese** ✅ Raccomandato
- **CX32** (8GB RAM, 4 vCPU, 80GB NVMe): **€8.45/mese** ✅ Per grandi progetti
- **CX42** (16GB RAM, 6 vCPU, 160GB NVMe): **€16.90/mese**

**Consiglio**: Inizia con **CX22**, puoi fare upgrade anytime.

---

## 2. CREAZIONE SERVER CLOUD

### 2.1 Creazione Server
1. Login su [Hetzner Cloud Console](https://console.hetzner.cloud)
2. Clicca **"Create Server"**
3. Configura:

#### **Location** (Datacenter):
- **Nuremberg** (nbg1) → Germania centrale ✅ Raccomandato
- **Falkenstein** (fsn1) → Germania est
- **Helsinki** (hel1) → Finlandia

#### **Image** (OS):
- **Ubuntu 24.04** (recommended) ✅
- oppure **Ubuntu 22.04 LTS**

#### **Type** (Server):
- **CX22** → 4GB RAM, 2 vCPU, 40GB NVMe ✅

#### **SSH Key**:
```bash
# Genera chiave SSH locale
ssh-keygen -t ed25519 -C "agenziecase@hetzner"

# Copia la chiave pubblica
cat ~/.ssh/id_ed25519.pub
```
1. In Hetzner: **"Add SSH Key"**
2. Incolla la chiave pubblica
3. Nome: `agenziecase-key`

#### **Networking**:
- **Enable Backups** → ON
- **Enable Firewall** → ON (dopo crea rules)

#### **Name**:
- `agenziecase-prod`

### 2.2 Crea Server
1. Clicca **"Create Server"**
2. Attendi 1-2 minuti
3. Copia **IP address** (es. `157.90.123.45`)
4. Copia **root password** (salvala in password manager!)

---

## 3. CONFIGURAZIONE DNS

### 3.1 Configura Dominio

#### Se hai già un dominio:
1. Vai nel tuo registrar (GoDaddy, Namecheap, etc.)
2. Aggiungi **A Record**:
   ```
   Type: A
   Name: @
   Value: 157.90.123.45 (tua IP)
   TTL: 3600
   ```
3. Aggiungi **A Record** per www:
   ```
   Type: A
   Name: www
   Value: 157.90.123.45 (tua IP)
   TTL: 3600
   ```

#### Se non hai dominio:
1. Compra dominio su [Namecheap](https://namecheap.com) (~€10/anno)
2. Domini suggeriti:
   - agenziecase.it
   - agenziacase-immobiliare.it
   - immobiliare-[tua-città].it

### 3.2 Verifica DNS
```bash
# Verifica propagazione DNS (può richiedere 24-48 ore)
nslookup agenziecase.it
```

---

## 4. SETUP SERVER

### 4.1 Connessione al Server
```bash
# Sostituisci con la tua IP
ssh root@157.90.123.45

# Prima volta: conferma con "yes"
# Inserisci password root (salvata da Hetzner)
```

### 4.2 Aggiorna Sistema
```bash
# Aggiorna packages
apt update && apt upgrade -y

# Installa utility base
apt install -y curl wget git vim htop ufw fail2ban

# Set timezone (opzionale)
timedatectl set-timezone Europe/Rome
```

### 4.3 Crea Utente Non-Root
```bash
# Crea utente
adduser agenzie
usermod -aG sudo agenzie

# Switch al nuovo utente
su - agenzie

# Setup SSH key per nuovo utente
mkdir -p ~/.ssh
chmod 700 ~/.ssh
vim ~/.ssh/authorized_keys
# Incolla la tua chiave pubblica SSH
chmod 600 ~/.ssh/authorized_keys
```

### 4.4 Configura Firewall
```bash
# Configura UFW (Uncomplicated Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 4.5 Installa Docker
```bash
# Aggiungi Docker repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installa Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Aggiungi utente al gruppo docker
sudo usermod -aG docker agenzie

# Verifica installazione
docker --version
docker compose version
```

### 4.6 Installa Nginx (Reverse Proxy)
```bash
sudo apt install -y nginx

# Abilita e avvia nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 5. DEPLOY APPLICAZIONE

### 5.1 Clona Repository
```bash
# Crea directory progetto
sudo mkdir -p /var/www/agenziecase
sudo chown -R agenzie:agenzie /var/www/agenziecase

# Clona repository (sostituisci con la tua URL)
cd /var/www/agenziecase
git clone https://github.com/tuo-username/agenziecase.git .

# Oppure se usi GitHub private key
# GIT_SSH_COMMAND="ssh -i ~/.ssh/github_key" git clone git@github.com:tuo-username/agenziecase.git .
```

### 5.2 Configura Environment Variables
```bash
# Crea environment file
cp .env.production .env

# Edit con le tue credenziali
vim .env
```

**Configura .env:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agenziecase_prod
DB_USER=agenziecase_user
DB_PASSWORD=cambia-questa-password-sicura!

# JWT
JWT_SECRET=cambia-questo-jwt-secret-super-sicuro!
JWT_EXPIRE=7d

# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://agenziecase.it

# API Keys
GROQ_API_KEY=your-groq-api-key-here

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5.3 Installa PostgreSQL
```bash
# Installa PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Avvia PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crea database e utente
sudo -u postgres psql
```

**In PostgreSQL:**
```sql
-- Crea database
CREATE DATABASE agenziecase_prod;

-- Crea utente con password sicura
CREATE USER agenziecase_user WITH ENCRYPTED PASSWORD 'tua-password-sicura';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE agenziecase_prod TO agenziecase_user;

-- Esci da PostgreSQL
\q
```

### 5.4 Deploy con Docker Compose
```bash
# Build e avvia container
docker compose -f docker-compose.production.yml up -d --build

# Verifica che i container siano running
docker ps

# Controlla logs
docker compose logs -f
```

---

## 6. CONFIGURAZIONE SSL

### 6.1 Installa Certbot
```bash
# Installa Certbot
sudo apt install -y certbot python3-certbot-nginx

# Ferma nginx temporaneamente
sudo systemctl stop nginx
```

### 6.2 Ottieni Certificati SSL
```bash
# Ottieni certificati Let's Encrypt
sudo certbot certonly --standalone \
  -d agenziecase.it \
  -d www.agenziecase.it \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Verifica certificati
sudo ls -la /etc/letsencrypt/live/agenziecase.it/
```

### 6.3 Configura Nginx
```bash
# Crea configurazione nginx
sudo vim /etc/nginx/sites-available/agenziecase
```

**Incolla questa configurazione:**
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name agenziecase.it www.agenziecase.it;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name agenziecase.it www.agenziecase.it;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/agenziecase.it/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agenziecase.it/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/api/health;
        access_log off;
    }
}
```

### 6.4 Abilita Configurazione Nginx
```bash
# Abilita sito
sudo ln -s /etc/nginx/sites-available/agenziecase /etc/nginx/sites-enabled/

# Rimuovi default site
sudo rm /etc/nginx/sites-enabled/default

# Test configurazione nginx
sudo nginx -t

# Riavvia nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6.5 Auto-Rinnovo SSL
```bash
# Testa rinnovo automatico
sudo certbot renew --dry-run

# Certbot ha già creato un cron job per rinnovo automatico
# Verifica con:
sudo systemctl list-timers | grep certbot
```

---

## 7. MONITORING & BACKUP

### 7.1 Setup Monitoring Base

#### Installa Netdata (Real-time monitoring):
```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Accessibile su https://agenziecase.it:19999
```

#### Setup Uptime Monitoring ( gratuito ):
1. Vai su [uptime.robot](https://uptimerobot.com)
2. Aggiungi monitor: `https://agenziecase.it`
3. Configura alert email

### 7.2 Configura Backup Automatici

#### Database Backup:
```bash
# Crea directory backup
sudo mkdir -p /backups/database
sudo chown -R agenzie:agenzie /backups

# Crea script di backup
vim /home/agenzie/backup-db.sh
```

**Script backup:**
```bash
#!/bin/bash

# Database backup script
BACKUP_DIR="/backups/database"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/agenziecase_$TIMESTAMP.sql"

# Create backup
PGPASSWORD="tua-password" pg_dump -h localhost -U agenziecase_user agenziecase_prod > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "agenziecase_*.sql.gz" -mtime +7 -delete

echo "Backup completed: agenziecase_$TIMESTAMP.sql.gz"
```

```bash
# Rendi script eseguibile
chmod +x /home/agenzie/backup-db.sh

# Aggiungi a crontab (backup giornaliero alle 2 AM)
crontab -e
```

**Aggiungi a crontab:**
```
0 2 * * * /home/agenzie/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### 7.3 Log Management
```bash
# Installa logrotate (già installato di solito)
sudo vim /etc/logrotate.d/agenziecase
```

**Configurazione logrotate:**
```
/var/www/agenziecase/server/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 agenzie agenzie
    sharedscripts
}
```

---

## 8. TROUBLESHOOTING

### 8.1 Check Status Container
```bash
# Tutti i container
docker ps -a

# Logs specifici
docker logs agenziecase-backend
docker logs agenziecase-frontend
docker logs agenziecase-postgres
```

### 8.2 Restart Servizi
```bash
# Restart singolo container
docker compose restart backend

# Restart tutti i container
docker compose restart

# Restart nginx
sudo systemctl restart nginx
```

### 8.3 Database Issues
```bash
# Entra nel container database
docker exec -it agenziecase-postgres psql -U agenziecase_user -d agenziecase_prod

# Verifica connessioni
SELECT count(*) FROM pg_stat_activity;
```

### 8.4 SSL Issues
```bash
# Verifica certificati
sudo certbot certificates

# Forza rinnovo
sudo certbot renew --force-renewal

# Riavvia nginx
sudo systemctl restart nginx
```

### 8.5 Performance Issues
```bash
# Controlla risorse
htop

# Controlla spazio disco
df -h

# Controlla logs
sudo journalctl -u nginx -n 50
```

---

## ✅ CHECKLIST POST-DEPLOY

### Test Funzionalità Critica:
- [ ] Home page carica: `https://agenziecase.it`
- [ ] API health check: `https://agenziecase.it/api/health`
- [ ] Login funziona
- [ ] Ricerca immobili funziona
- [ ] Upload immagini funziona
- [ ] SSL/HTTPS funzionante
- [ ] Mobile responsive
- [ ] Database backup attivo

### Verifica Performance:
- [ ] Page load time < 3 secondi
- [ ] API response time < 500ms
- [ ] Nessun errore console
- [ ] CPU < 70%
- [ ] RAM < 80%
- [ ] Spazio disco sufficiente

### Verifica Security:
- [ ] HTTPS attivo
- [ ] Firewall attivo
- [ ] Solo porte 80, 443 aperte
- [ ] Database non accessibile esternamente
- [ ] Environment variables sicure
- [ ] Backup automatici attivi

---

## 🎉 DEPLOY COMPLETATO!

Il tuo sito AgenzieCase è ora **live in produzione** su Hetzner! 🚀

### Accessi:
- **Frontend**: https://agenziecase.it
- **API**: https://agenziecase.it/api
- **Health**: https://agenziecase.it/api/health
- **Netdata**: https://agenziecase.it:19999

### Costi Mensali Stimati:
- **Server Hetzner CX22**: ~€4.23
- **Dominio**: ~€0.83/mese (€10/anno)
- **TOTALE**: ~€5.06/mese

### Next Steps:
1. Monitora per 24-48 ore
2. Verifica tutti i flussi utente
3. Configura analytics (Google Analytics)
4. Setup error tracking (Sentry)
5. Aggiorna DNS se necessario

---

**Deploy completato con successo!** 🎊