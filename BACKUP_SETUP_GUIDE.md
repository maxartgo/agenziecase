# 💾️ Backup Automatizzati - Setup Completo

## 📋 Overview

Sistema di backup automatizzato per il database PostgreSQL di agenziecase.com.

## ✅ Componenti

### Script Backup
- **File**: `scripts/agenziecase-backup.sh`
- **Frequenza**: Giornaliero
- **Orario**: 02:00 AM (orario server)
- **Retention**: 7 giorni
- **Location**: `/var/www/agenziecase/backups/postgresql`

### Caratteristiche
- ✅ Backup compresso (gzip)
- ✅ Pulizia automatica backup vecchi
- ✅ Verifica integrità backup
- ✅ Log operazioni
- ✅ Spazio disco monitorato

---

## 🚀 Configurazione sul Server

### Step 1: Copia lo script sul server

```bash
# Connettiti al server
ssh -i $env:USERPROFILE\.ssh\agenziecase_hetzner root@178.104.183.66

# Vai nel progetto
cd /var/www/agenziecase

# Crea directory scripts
mkdir -p scripts

# Copia lo script (incolla il contenuto localmente)
nano scripts/agenziecase-backup.sh
# Incolla il contenuto dello script e salva (Ctrl+X, Y, Enter)

# Rendi eseguibile
chmod +x scripts/agenziecase-backup.sh
```

### Step 2: Configura Cron Job

```bash
# Apri crontab
crontab -e

# Aggiungi questa riga per backup giornaliero alle 02:00
0 2 * * * /var/www/agenziecase/scripts/agenziecase-backup.sh >> /var/www/agenziecase/logs/backup.log 2>&1

# Salva ed esci (Ctrl+X, Y, Enter)
```

### Step 3: Verifica

```bash
# Verifica che il cron job sia attivo
crontab -l

# Test manuale dello script
/var/www/agenziecase/scripts/agenziecase-backup.sh

# Verifica backup
ls -lah /var/www/agenziecase/backups/postgresql/
```

---

## 📊 Backup Details

### Cosa viene backuppato
- ✅ Database completo PostgreSQL
- � Schema, dati, utenti
- ✅ Sequenze ed indici

### Non backuppato
- ❌ File upload (uploads/)
- ❌ Container Docker
- ❌ Codice sorgente (su Git)

### Localizzazione
```
/var/www/agenziecase/backups/postgresql/
├── agenziecase_backup_20260507_020000.sql.gz
├── agenziecase_backup_20260508_020000.sql.gz
├── ...
└── agenziecase_backup_20260514_020000.sql.gz
```

---

## 🔍 Recovery (Restore)

### Per ripristinare un backup:

```bash
# Sulla macchina locale o altro server
scp root@178.104.183.66:/var/www/agenziecase/backups/postgresql/agenziecase_backup_latest.sql.gz .

# Estrai e decomprimi
gunzip agenziecase_backup_latest.sql.gz

# Ripristina nel database (attento: sovrascrive dati!)
psql -h 178.104.183.66 -U agenziecase_prod -d agenziecase_prod < agenziecase_backup_latest.sql
```

### Ripristino dal container:

```bash
# Sul server
docker exec -i agenziecase-db-1 psql -U agenziecase_prod agenziecase_prod < /var/www/agenziecase/backups/postgresql/agenziecase_backup_latest.sql
```

---

## 📈 Monitoring Backup

### Verifica log backup:
```bash
tail -f /var/www/agenziecase/logs/backup.log
```

### Statistiche backup:
```bash
# Numero di backup salvati
ls /var/www/agenziecase/backups/postgresql/ | wc -l

# Spazio usato
du -sh /var/www/agenziecase/backups/postgresql/

# Backup più recente
ls -lt /var/www/agenziecase/backups/postgresql/ | head -1
```

---

## ⚠️ Gestione Errori

### Se il backup fallisce:
1. Controlla i log: `tail -50 /var/www/agenziecase/logs/backup.log`
2. Verifica spazio disco: `df -h`
3. Verifica che il container DB sia attivo: `docker ps | grep postgres`
4. Test connessione DB: `docker exec -it agenziecase-db-1 psql -U agenziecase_prod -d postgres`

### Notifiche (opzionale)
Puoi aggiungere notifiche Slack/Email nello script:
```bash
# Aggiungi dopo ogni log() che invoca notify_error():
curl -X POST -H "Content-Type: application/json" \
  -d "{\"text\":\"❌ Backup fallito: $error_message\"}" \
  YOUR_SLACK_WEBHOOK_URL
```

---

## 🔒 Best Practices

### Produzione
- ✅ Backup giornaliero automatico
- ✅ Retention 7 giorni
- ✅ Backup offsite (opzionale)
- ✅ Test restore mensile

### Sviluppo
- ⏳ Backup orario diverso
- ⏳ Retention più breve
- ⏳ Test restore frequente

---

## 📞 Troubleshooting

### Cron non esegue
```bash
# Verifica cron service
systemctl status cron

# Riavvia cron
systemctl restart cron

# Verifica crontab
crontab -l
```

### Backup vuoto o corrotto
```bash
# Verifica spazio
df -h

# Verifica permessi
ls -la /var/www/agenziecase/backups/postgresql/

# Test manuale
docker exec agenziecase-db-1 pg_dump -U agenziecase_prod -d agenziecase_prod | head
```

---

**Creato:** 2026-05-07
**Frequenza:** Giornaliero (02:00 AM server time)
**Retention:** 7 giorni
**Stato:** ⏳ Da configurare sul server
