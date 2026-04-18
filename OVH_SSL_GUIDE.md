# 🔒 GUIDA SSL SU OVH - AGENZIECASE

## 📍 Dove trovare la configurazione SSL su OVH

### 1. Accedi al Pannello OVH
1. Vai su **https://www.ovh.com/auth**
2. Login con le tue credenziali
3. Clicca su **"Domini"** nella sezione "Prodotti"

## 🔧 Opzioni SSL su OVH

### OPZIONE 1: SSL Gratuito OVH (Raccomandato) ⭐

#### Per domini EU:
1. Nel pannello OVH, vai su **"Domini"** > **"agenziecase.com"**
2. Clicca sulla tab **"SSL"** o **"Sicurezza"**
3. Cerca l'opzione **"SSL Gratuito"** o **"Let's Encrypt OVH"**
4. Clicca su **"Attiva"** o **"Ordina"**
5. Segui il wizard di configurazione

#### Configurazione DNS automatica:
- OVH configurerà automaticamente i record DNS necessari
- SSL sarà attivo in 15-30 minuti

### OPZIONE 2: SSL a Pagamento OVH
1. Vai su **"Domini"** > **"agenziecase.com"** > **"SSL"**
2. Scegli tra:
   - **SSL Standard** (~€10/anno)
   - **SSL Wildcard** (~€50/anno)
3. Completa l'ordine e installa il certificato

### OPZIONE 3: Disabilita Proxy OVH (Per Lets' Encrypt diretto)

Se vuoi usare Lets' Encrypt direttamente sul tuo server:

#### 1. Controlla Redirect OVH:
1. Nel pannello OVH vai su **"Domini"** > **"agenziecase.com"**
2. Clicca sulla tab **"Reindirizzamenti"** o **"Redirect"**
3. **Rimuovi qualsiasi redirect** verso pagine di "costruzione"

#### 2. Controlla DNS OVH:
1. Vai su **"Domini"** > **"agenziecase.com"** > **"DNS"**
2. Verifica i record **A**:
   ```
   @ (o vuoto)  A  178.104.183.66
   www          A  178.104.183.66
   ```
3. Rimuovi eventuali record CNAME o redirect

#### 3. Attiva DNS Solo:
1. Assicurati che **"OVH DNS"** sia attivo
2. Disabilita servizi di forwarding o proxy

### OPZIONE 4: Cloudflare SSL (Alternativa)

Se usi Cloudflare per il DNS:

1. Accedi a **https://dash.cloudflare.com**
2. Seleziona il dominio **agenziecase.com**
3. Vai su **"SSL/TLS"**
4. Imposta **"Flexible SSL"** o **"Full SSL"**
5. Attiva **"Always Use HTTPS"**

## 🚀 Dopo la Configurazione SSL su OVH

### Se usi SSL OVH:
1. Nel pannello OVH, scarica i file del certificato
2. Caricali sul server:
   ```bash
   ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66
   mkdir -p /etc/ssl/ovh
   # Copia i file del certificato qui
   ```

3. Aggiorna nginx-ssl.conf:
   ```bash
   ssl_certificate /etc/ssl/ovh/tuo_certificato.crt;
   ssl_certificate_key /etc/ssl/ovh/tua_chiave.key;
   ```

### Se disabiliti proxy OVH per Lets' Encrypt:
1. Attendi 15-30 minuti per la propagazione DNS
2. Esegui sul server:
   ```bash
   ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66
   certbot --nginx -d agenziecase.com -d www.agenziecase.com
   ```

3. Aggiorna docker-compose per usare Lets' Encrypt:
   ```yaml
   volumes:
     - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro
     - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

## 🔍 Verifica Configurazione DNS

### Per verificare che il DNS punti correttamente:
```bash
# Verifica record A
dig agenziecase.com +short
dig www.agenziecase.com +short

# Dovrebbe restituire: 178.104.183.66
```

### Per verificare che non ci siano redirect:
```bash
# Verifica HTTP response
curl -I http://agenziecase.com
# Dovrebbe mostrare: Server: nginx (non "Pagina in costruzione")
```

## 🛠️ Troubleshooting OVH

### Problema: DNS non aggiorna
1. Verifica che i TTL siano bassi (300-600 secondi)
2. Attendi 24-48 ore per propagazione completa
3. Controlla di non aver attivato "DNSSEC" per errore

### Problema: Redirect OVH persistenti
1. Controlla nella sezione **"Reindirizzamenti"** del pannello OVH
2. Rimuovi tutti i redirect attivi
3. Verifica nella sezione **"Hosting"** che non ci sia hosting attivo

### Problema: SSL non si attiva
1. Verifica che il dominio sia attivo da almeno 24-48 ore
2. Controlla che i DNS siano configurati correttamente
3. Contatta il supporto OVH se necessario

## 📞 Supporto OVH

- **Telefonico**: +39 02 500 437 44 (Lun-Ven 9-18)
- **Chat**: Disponibile nel pannello OVH
- **Email**: Tramit form di supporto

## ✅ Checklist Completamento

- [ ] Ho trovato la sezione SSL nel pannello OVH
- [ ] Ho attivato SSL gratuito o a pagamento
- [ ] Ho rimosso redirect/pagine di costruzione
- [ ] Ho verificato che il DNS punti al server Hetzner
- [ ] Ho testato che il sito risponda correttamente
- [ ] HTTPS funziona senza avvisi nel browser

---

**Prossimo passo**: Scegli l'opzione che preferisci e completiamo la configurazione SSL! 🚀