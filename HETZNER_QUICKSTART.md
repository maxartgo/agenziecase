# 🚀 Deploy Produzione Hetzner - Quick Start

## ⚡ START VELOCE (30 minuti)

### 1. Crea Server Hetzner (5 min)
```bash
1. Vai su https://console.hetzner.cloud
2. "Create Server"
3. Seleziona: Ubuntu 24.04 + CX22 (€4.23/mese)
4. Aggiungi la tua SSH key
5. Crea server → Copia IP (es. 157.90.123.45)
```

### 2. Connessione + Setup (10 min)
```bash
# Connetti al server
ssh root@157.90.123.45

# Aggiorna + installa Docker
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin nginx git

# Clona progetto
adduser agenzie
usermod -aG sudo,docker agenzie
su - agenzie
cd /var/www
sudo mkdir agenziecase
sudo chown agenzie:agenzie agenziecase
cd agenziecase
git clone https://github.com/tuo-username/agenziecase.git .
```

### 3. Configura Environment (5 min)
```bash
cp .env.production .env
vim .env  # Inserisci le tue credenziali
```

### 4. Deploy Applicazione (5 min)
```bash
docker compose -f docker-compose.production.yml up -d --build
docker ps  # Verifica che container siano running
```

### 5. SSL Certificates (5 min)
```bash
# Installa Certbot
apt install -y certbot python3-certbot-nginx

# Ottieni certificati
certbot certonly --standalone -d agenziecase.it -d www.agenziecase.it

# Configura nginx (vedi sotto)
```

### 6. Configura Nginx (5 min)
```bash
# Copia configurazione nginx
vim /etc/nginx/sites-available/agenziecase
# (Incolla configurazione da HETZNER_DEPLOYMENT.md)

# Abilita sito
ln -s /etc/nginx/sites-available/agenziecase /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 7. Verifica Deploy (2 min)
```bash
# Test health check
curl https://agenziecase.it/api/health

# Test frontend
curl https://agenziecase.it

# Verifica SSL
curl https://agenziecase.it -I
```

---

## 🔥 SEGNAPUNTO RAPIDO

### SSH nel Server:
```bash
ssh agenzie@157.90.123.45
cd /var/www/agenziecase
```

### Logs Importanti:
```bash
# Container logs
docker compose logs -f

# Nginx logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### Restart Servizi:
```bash
# Restart app
docker compose restart

# Restart nginx
sudo systemctl restart nginx
```

### Database Backup:
```bash
# Backup manuale
docker exec agenziecase-postgres pg_dump -U agenziecase_user agenziecase_prod > backup.sql

# Restore backup
docker exec -i agenziecase-postgres psql -U agenziecase_user agenziecase_prod < backup.sql
```

### Update Applicazione:
```bash
# Pull ultimi changes
git pull origin main

# Rebuild e restart
docker compose down
docker compose -f docker-compose.production.yml up -d --build
```

---

## 📱 URL UTILI

- **Hetzner Console**: https://console.hetzner.cloud
- **Tuo Sito**: https://agenziecase.it
- **Health Check**: https://agenziecase.it/api/health
- **Netdata Monitoring**: https://agenziecase.it:19999
- **SSH**: `ssh agenzie@157.90.123.45`

---

## 🆘 EMERGENZE

### Site Down:
```bash
ssh agenzie@157.90.123.45
cd /var/www/agenziecase
docker compose restart
```

### Database Issues:
```bash
docker restart agenziecase-postgres
docker logs agenziecase-postgres
```

### SSL Issues:
```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

### Performance Lenta:
```bash
htop  # Controlla risorse
docker stats  # Controlla container
df -h   # Controlla disco
```

---

## ✅ DEPLOY CHECKLIST

**Pre-Deploy:**
- [ ] Server Hetzner creato
- [ ] Dominio configurato (A records)
- [ ] SSH key aggiunta
- [ ] Git repository pronto

**Post-Deploy:**
- [ ] HTTPS funzionante
- [ ] Home page carica
- [ ] API risponde
- [ ] Database backup attivo
- [ ] Monitoring attivo
- [ ] Firewall configurato
- [ ] Logs funzionanti

---

## 🎉 DONE!

Il tuo sito è **LIVE** su Hetzner! 🚀

**Costo**: ~€5/mese  
**Tempo setup**: ~30 minuti  
**Uptime**: 99.9% garantito

Per guida dettagliata, vedi `HETZNER_DEPLOYMENT.md`