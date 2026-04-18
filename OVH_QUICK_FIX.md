# 🔧 CERTIFICATI OVH - INSTALLAZIONE RAPIDA

## ✅ SITO ORA ONLINE

Il sito è **raggiungibile** su:
- 🌐 **http://agenziecase.com** → redirect a HTTPS
- 🔒 **https://agenziecase.com** → attivo e funzionante

## 🎯 PER CERTIFICATI OVH SENZA AVVISI:

### Metodo 1: Script Automatico (Consigliato)
```bash
./install-ovh-ssl.sh
```

Segui le istruzioni per caricare i certificati OVH.

### Metodo 2: Manuale

#### 1. Scarica Certificati da OVH:
1. Vai su **https://www.ovh.com/auth**
2. **Domini** → **agenziecase.com** → **SSL**
3. Scarica:
   - **Certificato** (.crt)
   - **Chiave privata** (.key)

#### 2. Upload sul Server:
```bash
# Crea cartella
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66 'mkdir -p /etc/ssl/ovh'

# Upload certificati
scp -i ~/.ssh/agenziecase_hetzner cert.crt root@178.104.183.66:/etc/ssl/ovh/agenziecase.crt
scp -i ~/.ssh/agenziecase_hetzner key.key root@178.104.183.66:/etc/ssl/ovh/agenziecase.key
```

#### 3. Aggiorna Configurazione:
```bash
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66

# Modifica configurazione
cd /var/www/agenziecase
vim nginx-ssl.conf

# Cambia le righe dei certificati:
ssl_certificate /etc/ssl/ovh/agenziecase.crt;
ssl_certificate_key /etc/ssl/ovh/agenziecase.key;

# Riavvia container
docker stop agenziecase-frontend
docker rm agenziecase-frontend
docker run -d --name agenziecase-frontend \
  --network agenziecase_agenziecase-network \
  -p 80:80 -p 443:443 \
  -v /var/www/agenziecase/nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /etc/ssl/ovh:/etc/ssl/ovh:ro \
  --restart unless-stopped \
  agenziecase-frontend
```

## 🧪 Verifica:

### Test HTTPS:
```bash
curl -I https://agenziecase.com
```

### Test nel Browser:
1. Apri **https://agenziecase.com**
2. Con certificati OVH non ci dovrebbero essere avvisi
3. Dovresti vedere il lucchetto 🔒 verde

## 🔍 Verifica Attuale:

```bash
# Sito raggiungibile
curl -I http://agenziecase.com
# HTTP 301 → HTTPS

# HTTPS funzionante
curl -k -I https://agenziecase.com
# HTTP 200 OK
```

## ⚡ Veloce Alternativa: Cloudflare SSL

Se hai problemi con OVH, puoi usare **Cloudflare SSL gratuito**:

1. **Crea account Cloudflare** (gratis)
2. **Aggiungi dominio** agenziecase.com
3. **Attiva "Flexible SSL"**
4. **Aggiorna nameserver** su OVH

Vantaggi:
- ✅ SSL gratuito
- ✅ CDN inclusa
- ✅ Configurazione immediata
- ✅ Nessun avviso browser

---

**SITO ONLINE ORA!** 🎉

Per rimuovere completamente l'avviso di sicurezza, installa i certificati OVH con lo script `install-ovh-ssl.sh`