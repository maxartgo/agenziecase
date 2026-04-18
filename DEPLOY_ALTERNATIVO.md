# 🚀 Deploy Diretto su Hetzner - Piano Alternativo

## ⚠️ SITUAZIONE
- GitHub Push Protection blocca il push per API keys
- Problemi con git history complicati

## ✅ SOLUZIONE: Deploy Diretto
Carico direttamente i file sul server Hetzner, saltando GitHub temporaneamente.

---

## 📋 PIANO DI DEPLOY DIRETTO

### 1. Carico File Essenziali
```bash
# Clono il repository vuoto e poi carico i file via SCP
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66 "cd /var/www/agenziecase && git pull"
```

### 2. Configuro Environment
```bash
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66 "cd /var/www/agenziecase && cp .env.production .env && vim .env"
```

### 3. Deploy Docker
```bash
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66 "cd /var/www/agenziecase && docker compose -f docker-compose.hetzner.yml up -d --build"
```

---

## 🎯 SE PREFERISCI RISOLVERE GITHUB

Disabilita temporaneamente Push Protection:
1. https://github.com/maxartgo/agenziecase/settings/rules
2. Trova "Push Protection"
3. Disabilita "Block pushes that contain secrets"
4. Dimmi "OK"

---

## ⏳ TEMPI
- Deploy diretto: **10 minuti**
- Risolvere GitHub + Deploy: **15 minuti**

**Come preferisci procedere?**