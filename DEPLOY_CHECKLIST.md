# 📋 Checklist Deploy Hetzner - 178.104.183.66

## ✅ PRE-DEPLOY CHECKLIST

### Server Info:
- **IP**: 178.104.183.66
- **Provider**: Hetzner
- **Location': Probabilmente Nuremberg/Falkenstein
- **OS**: Ubuntu 24.04
- **Type**: CX22 (4GB RAM, 2 vCPU)

### SSH Connection:
- **Chiave SSH**: `~/.ssh/agenziecase_hetzner` ✅
- **Comando**: `ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66`
- **Password**: Check email Hetzner

---

## 🚀 DEPLOY STEPS

### Step 1: Connessione SSH
```bash
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66
```
- [ ] Connessione riuscita
- [ ] Verifica che sei root: `whoami`

### Step 2: Setup Sistema
```bash
apt update && apt upgrade -y
apt install -y curl wget git vim htop ufw fail2ban
```
- [ ] Packages aggiornati
- [ ] Utility installate

### Step 3: Firewall
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```
- [ ] Firewall attivo
- [ ] Solo porte 22,80,443 aperte

### Step 4: Docker
```bash
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
docker --version
```
- [ ] Docker installato
- [ ] Docker Compose disponibile

### Step 5: Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```
- [ ] Nginx running
- [ ] Nginx enabled

### Step 6: Utente App
```bash
adduser agenzie
usermod -aG sudo,docker agenzie
# ... (vedi guida completa)
```
- [ ] Utente agenzie creato
- [ ] Permessi configurati

### Step 7: Git Repository
```bash
cd /var/www
git clone [tua-repo-url] agenziecase
cd agenziecase
```
- [ ] Repository clonato
- [ ] File presenti

### Step 8: Environment
```bash
cp .env.production .env
vim .env
```
- [ ] .env configurato
- [ ] Credenziali inserite

### Step 9: Docker Deploy
```bash
docker compose -f docker-compose.hetzner.yml up -d --build
```
- [ ] Container buildati
- [ ] Container running

### Step 10: Verification
```bash
docker ps
curl http://localhost:3001/api/health
curl http://localhost:3000
```
- [ ] Backend running
- [ ] Frontend running
- [ ] Health check OK

---

## ✅ POST-DEPLOY CHECKLIST

### Accessi URL:
- [ ] http://178.104.183.66 (Frontend)
- [ ] http://178.104.183.66/api (API)
- [ ] http://178.104.183.66/api/health (Health)

### Funzionalità:
- [ ] Home page carica
- [ ] API risponde
- [ ] Login funziona
- [ ] Cerca immobili funziona
- [ ] No errori console

### Security:
- [ ] Firewall configurato
- [ ] Solo porte essenziali aperte
- [ ] SSH key funzionante
- [ ] Environment variables sicure

---

## 🔧 COMANDI UTILI

### Restart Servizi:
```bash
# Restart app
cd /var/www/agenziecase
docker compose restart

# Restart nginx
systemctl restart nginx
```

### View Logs:
```bash
# App logs
docker compose logs -f

# Nginx logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### System Status:
```bash
# Container status
docker ps

# System resources
htop

# Disk space
df -h

# Memory
free -h
```

---

## 🆘 TROUBLESHOOTING

### Container non partono:
```bash
docker compose logs -f
# Controlla errori nei logs
```

### Connessione fallisce:
```bash
# Verifica SSH key
ssh -i ~/.ssh/agenziecase_hetzner -v root@178.104.183.66
# -v per verbose mode
```

### Nginx errori:
```bash
nginx -t
# Test configurazione
systemctl status nginx
# Controlla status
```

### Database connection error:
```bash
docker logs agenziecase-postgres
# Controlla database logs
```

---

## 🎉 DEPLOY COMPLETE!

Quando hai completato tutti i checks:
- ✅ Server configurato
- ✅ App deployata
- ✅ Tutti i sistemi funzionanti
- ✅ pronto per produzione!

**AgenzieCase is LIVE on Hetzner!** 🚀