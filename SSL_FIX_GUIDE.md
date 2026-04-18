# 🔧 FIX CERTIFICATO SSL - GUIDA RAPIDA

## ❌ Problema Identificato
Il server è online ma **HTTPS non funziona** perché:
- Nginx configurato solo per HTTP (porta 80)
- Nessun certificato SSL installato
- Manca configurazione TLS/HTTPS

## ✅ Soluzione Implementata
Ho creato i file necessari per abilitare HTTPS:

### 📁 File Creati:
1. **nginx-ssl.conf** - Configurazione nginx completa con SSL
2. **setup-ssl.sh** - Script automatico per installare certificati
3. **docker-compose.production.yml** - Aggiornato per montare certificati SSL

## 🚀 Passaggi per Completare l'Installazione

### 1. Installa Certificati SSL (5 minuti)
Esegui lo script automatico:
```bash
./setup-ssl.sh
```

Questo script:
- Installa Certbot sul server
- Ottiene certificati SSL gratuiti da Let's Encrypt
- Configura rinnovo automatico
- Verifica installazione

### 2. Deploy con Nuova Configurazione
```bash
./deploy-hetzner.sh
```

### 3. Verifica HTTPS
```bash
# Test HTTPS
curl -I https://agenziecase.com

# Test redirect HTTP→HTTPS
curl -I http://agenziecase.com
```

## 🔍 Verifica Manuale (se necessario)

### Connessione al Server:
```bash
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66
```

### Verifica Certificati:
```bash
certbot certificates
```

### Verifica Nginx:
```bash
nginx -t
systemctl status nginx
```

### Verifica Firewall:
```bash
ufw status
# Assicurati che porte 80, 443 siano allow
```

## 📋 Configurazione SSL Creata

### Caratteristiche:
- ✅ **HTTPS su porta 443** con HTTP/2
- ✅ **Redirect automatico** HTTP → HTTPS
- ✅ **SSL/TLS moderno** (TLSv1.2, TLSv1.3)
- ✅ **Security headers** completi
- ✅ **HSTS enabled** per maggiore sicurezza
- ✅ **Auto-renewal** configurato

### Certificati Let's Encrypt:
- **Gratuiti**
- **Validi 90 giorni** (rinnovo automatico)
- **Supportati da tutti i browser**
- **Perfect Forward Secrecy**

## 🛠️ Troubleshooting

### Se HTTPS non funziona:
```bash
# Riavvia nginx
systemctl restart nginx

# Forza rinnovo certificati
certbot renew --force-renewal

# Riavvia Docker
cd /var/www/agenziecase
docker compose restart frontend
```

### Se Certbot fallisce:
```bash
# Verifica che porte 80/443 siano aperte
ufw allow 80/tcp
ufw allow 443/tcp

# Verifica che DNS sia configurato
nslookup agenziecase.com
# Dovrebbe puntare a 178.104.183.66
```

### Se i certificati non vengono montati:
```bash
# Verifica permessi
ls -la /etc/letsencrypt/live/
ls -la /var/www/agenziecase/nginx-ssl.conf

# Assicurati che il percorso sia corretto
docker exec agenziecase-frontend ls -la /etc/letsencrypt/
```

## ✅ Checklist Post-Installazione

- [ ] Certificati installati (`certbot certificates`)
- [ ] Nginx configurato (`nginx -t`)
- [ ] Docker container running (`docker ps`)
- [ ] HTTPS funzionante (https://agenziecase.com)
- [ ] HTTP redirect a HTTPS
- [ ] Auto-renewal configurato (`systemctl list-timers | grep certbot`)

## 🎉 Risultato Atteso

Dopo l'installazione:
- **http://agenziecase.com** → redirect a **https://agenziecase.com**
- **https://agenziecase.com** → sito sicuro con 🔒
- **https://www.agenziecase.com** → funziona anche con www

## 📞 Supporto

Se hai problemi:
1. Controlla i logs: `docker logs agenziecase-frontend`
2. Verifica nginx: `systemctl status nginx`
3. Controlla certificati: `certbot certificates`

---

**Tempo stimato:** 10-15 minuti ⏱️
**Difficoltà:** Media 🟡
**Costo:** GRATUITO (Let's Encrypt) 🆓