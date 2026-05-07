# 🔐 Guida Amministratori - AgenzieCase

## 📋 Panoramica

Questa guida è per gli amministratori di sistema che gestiscono la piattaforma AgenzieCase, inclusi utenti, partner, configurazioni e monitoraggio.

---

## 🔑 Accesso Admin

### URL Admin
- **Produzione**: https://agenziecase.com/admin
- **Login**: Email amministratore + Password

### Ruoli Admin
- **Super Admin**: Accesso completo
- **Admin**: Gestione utenti e contenuti
- **Moderatore**: Solo approvazione contenuti

---

## 👥 Gestione Utenti

### Utenti Registrati
Vedi tutti gli utenti del portale:
- **Clienti finali**: Utenti che cercano immobili
- **Agenti**: Utenti associati a partner
- **Admin**: Staff di gestione

### Azioni su Utenti
Per ogni utente puoi:
- **Sospensione**: Disabilita temporaneamente
- **Eliminazione**: Rimuovi account
- **Reset password**: Invia email di recovery
- **View profile**: Vedi dettagli e attività

### Filtri Utenti
- Per ruolo
- Per data registrazione
- Per stato (attivo/sospeso)
- Per attività recente

---

## 🏢 Gestione Partner

### Lista Partner
Vedi tutte le agenzię immobiliari registrate:
- **Nome agenzia**
- **Partita IVA**
- **Email contatto**
- **Stato abbonamento**
- **Numero immobili**
- **Data registrazione**

### Creare Nuovo Partner
1. Clicca **"+ Aggiungi Partner"**
2. Compila:
   - **Nome agenzia**
   - **Partita IVA**
   - **Indirizzo completo**
   - **Contatti**
   - **Email riferimento**
   - **Tipo abbonamento**
3. Invia credenziali all'email specificata

### Modificare Partner
- **Informazioni base**: Nome, P.IVA, indirizzo
- **Abbonamento**: Upgrade/downgrade piano
- **Stato**: Attivo/Sospeso
- **Limite immobili**: Numero max di annunci

### Gestione Abbonamenti
**Piani disponibili:**
- **Free**: 5 immobili, funzionalità base
- **Pro**: 50 immobili, CRM completo
- **Enterprise**: Illimitati, API access

### CRM Subscription
Attiva/disattiva CRM per partner:
1. Seleziona partner
2. Toggle **"CRM Active"**
3. Imposta limite clienti

### Statistiche Partner
- **Immobili pubblicati**
- **Visualizzazioni totali**
- **Contatti ricevuti**
- **Tasso di conversione**

---

## 📊 Gestione Contenuti

### Moderazione Immobili
Gli immobili prima della pubblicazione:
- **In attesa**: Da approvare
- **Approvati**: Pubblicati
- **Rifiutati**: Non idonei

### Criteri Moderazione
Verifica prima di approvare:
- ✓ Foto reali e pertinenti
- ✓ Descrizione accurata
- ✓ Prezzo congruo
- ✓ Dati completi
- ✗ Contenuti offensivi
- ✗ Info false/misleading

### Azioni Moderazione
- **Approva**: Pubblica immediatamente
- **Rifiuta**: Richiedi modifiche
- **Segnala**: Marca per review

### Contenuti Segnalati
Utenti possono segnalare:
- Immobili con info errate
- Foto non reali
- Prezzi ingannevoli
- Comportamenti scorretti agenzie

---

## 🔧 Configurazioni Sistema

### Impostazioni Generali
- **Nome sito**: Titolo portale
- **Email contatto**: Indirizzo supporto
- **Telefono**: Numero verde
- **Social media**: Link profili

### Impostazioni Ricerca
- **Raggio geografico**: Default 10km
- **Prezzo min/max**: Limiti ricerca
- **Risultati per pagina**: Default 20

### Impostazioni Media
- **Max foto per immobile**: 30
- **Max dimensione foto**: 5MB
- **Formati accettati**: JPG, PNG, WEBP
- **Max video**: 50MB

### Impostazioni Notifiche
- **Email notifiche**: Sì/No
- **SMS notifiche**: Sì/No (con API)
- **Push notifications**: Sì/No
- **Frequenza digest**: Giornaliero/Settimanale

---

## 📈 Analytics e Monitoring

### Dashboard Statistiche
Metriche in tempo reale:
- **Utenti attivi**: Oggi/questa settimana
- **Immobili pubblicati**: Totale e nuovi
- **Ricerche effettuate**: Volume ricerche
- **Contatti inviati**: Lead generati
- **Tempo medio permanenza**: Engagement

### Reportistiche
Esporta dati:
- **Report giornaliero**: Email automatica
- **Report settimanale**: Executive summary
- **Report mensile**: Analisi completa
- **Custom**: Date range personalizzato

### Monitoring
Connesso a:
- **Sentry**: Error tracking in tempo reale
- **Plausible**: Analytics privacy-focused
- **Logs**: Sistema logs centralizzati

### Alert Configurabili
- **Errori critici**: Notifica immediata
- **Performance lenta**: > 3 secondi
- **Disk space**: < 20% libero
- **Database connections**: > 80% utilizzo

---

## 🔒 Sicurezza

### Gestione Admin
- **Crea admin**: Solo super admin
- **Permessi**: Ruolo-based access control
- **Audit log**: Tracciamento azioni

### Password Policy
- Minimo 12 caratteri
- Maiuscole + minuscole
- Numeri + simboli
- Scadenza ogni 90 giorni

### 2FA (Two-Factor Authentication)
- Raccomandato per tutti admin
- Obbligatorio per super admin
- App: Google Auth, Authy

### IP Whitelist
Configura IP attendibili per admin access.

### Session Management
- Timeout: 30 minuti inattività
- Max sessioni per utente: 3
- Revoca sessioni da devices specifici

---

## 🗄️ Backup e Recovery

### Backup Automatici
Il sistema esegue backup giornalieri:
- **Orario**: 02:00 AM server time
- **Retention**: 7 giorni
- **Location**: `/var/www/agenziecase/backups/postgresql`

### Contenuti Backup
✅ **Database completo**:
- Tabelle, dati, sequenze
- Utenti, immobili, CRM
- Configurazioni

❌ **Non backuppato**:
- File upload (su filesystem)
- Container Docker
- Codice sorgente (su Git)

### Restore Procedure
```bash
# Sul server
docker exec -i agenziecase-db-1 psql -U agenziecase_prod agenziecase_prod \
  < /var/www/agenziecase/backups/postgresql/agenziecase_backup_latest.sql
```

### Test Restore Mensile
Esegui test di restore mensilmente:
1. Backup staging environment
2. Restore in staging
3. Verifica integrità dati
4. Documenta risultato

---

## 🚀 Deploy e Updates

### Deploy Automatico (CI/CD)
Ogni push su `main`:
1. GitHub Actions si attiva
2. Run tests (57 backend, 105 frontend)
3. Build Docker images
4. Deploy su produzione
5. Health check automatici

### Deploy Manuale
Per deploy manuale:
```bash
# Sul server
ssh root@178.104.183.66
cd /var/www/agenziecase
git pull origin main
docker compose down
docker compose up -d --build
```

### Pre-Deploy Checklist
- [ ] Tests passano localmente
- [ ] Migration preparate
- [ ] Backup recente disponibile
- [ ] Maintanance window pianificata
- [ ] Rollback procedure pronta

### Post-Deploy Verification
- [ ] Sito risponde
- [ ] Login funziona
- [ ] Database migrations OK
- [ ] No errori su Sentry
- [ ] Performance normale

---

## 🛠️ Troubleshooting

### Problemi Comuni

#### Sito lento
1. Controlla CPU/RAM usage
2. Verifica query lente (Sentry)
3. Controlla cache Redis
4. Verifica CDN assets

#### Errori 500
1. Controlla logs: `docker compose logs backend`
2. Verifica Sentry per errori critici
3. Controlla database connection
4. Verifica ENV variables

#### Login non funziona
1. Verifica AUTH_SECRET corretto
2. Controlla JWT non scaduto
3. Verifica database utenti
4. Controlla rate limiting

#### Upload fallisce
1. Verifica spazio disco
2. Controlla permessi directory
3. Verifica dimensione file
4. Controlla content-type

### Commands Utili

```bash
# Status container
docker compose ps

# Logs backend
docker compose logs -f backend

# Restart singolo servizio
docker compose restart backend

# Database console
docker exec -it agenziecase-db-1 psql -U agenziecase_prod

# Spazio disco
df -h

# Memory usage
free -h

# Processi attivi
htop
```

---

## 📞 Supporto Tecnico

### Contatti Emergenza
- **On-call**: [Numero telefono]
- **Slack**: #agenziecase-alerts
- **Email**: tech-lead@agenziecase.com

### Risorse
- **Repository**: GitHub private
- **Documentation**: `/docs` folder
- **Runbooks**: `/docs/runbooks`
- **Architecture**: `/docs/architecture`

---

## 📅 Manutenzione Programmata

### Daily
- 02:00: Backup automatico
- 06:00: Logs rotation
- Ogni ora: Health check

### Weekly
- Lunedì 03:00: Database vacuum
- Mercoledì 03:00: Docker system prune
- Venerdì: Review Sentry issues

### Monthly
- Giorno 1: Test restore backup
- Giorno 15: Security updates
- Giorno 20: Performance review
- Giorno 25: Capacity planning

---

**Ultimo aggiornamento:** 2026-05-07
**Versione:** 1.0
**Server:** Hetzner 178.104.183.66
**Path:** /var/www/agenziecase
