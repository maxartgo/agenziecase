# 🔧 CLOUDFLARE CONFIGURATION FIX

## 🚨 PROBLEMA IDENTIFICATO

Il dominio `agenziecase.com` punta a **Cloudflare** ma Cloudflare non è configurato correttamente per puntare al tuo server Hetzner (178.104.183.66).

---

## 📋 PASSI PER RISOLVERE

### 1. Accedi a Cloudflare Dashboard
- Vai su: https://dash.cloudflare.com
- Seleziona il dominio `agenziecase.com`

### 2. Configura i DNS Record

**DNS → Records**

#### Record A per il dominio principale:
```
Type: A
Name: @ (o agenziecase.com)
IPv4 address: 178.104.183.66
Proxy status: Proxied (☁️ orange cloud) ✓
TTL: Auto
```

#### Record A per www:
```
Type: A
Name: www
IPv4 address: 178.104.183.66
Proxy status: Proxied (☁️ orange cloud) ✓
TTL: Auto
```

### 3. Configura SSL/TLS

**SSL/TLS → Overview**
- Seleziona: **"Full"** o **"Full (strict)"**
- **NON** usare "Flexible"

### 4. Imposta Page Rules (se necessario)

**Rules → Page Rules**

Crea una regola per reindirizzare HTTP → HTTPS:
```
URL: http://agenziecase.com/*
Settings: Always Use HTTPS
```

### 5. Verifica configurazione

Dopo 5-10 minuti, verifica:
```bash
# Test dal tuo computer
curl -I http://agenziecase.com
curl -I https://agenziecase.com

# Dovresti vedere:
# Server: cloudflare
# E non: OVHcloud
```

---

## 🔍 VERIFICHE

### 1. Verifica DNS Cloudflare
```bash
dig +short agenziecase.com
```
Dovresti vedere IP Cloudflare, non direttamente 178.104.183.66

### 2. Verifica che Cloudflare faccia da proxy
```bash
curl -I http://agenziecase.com
```
Dovresti vedere:
```
Server: cloudflare
```
NON:
```
Server: OVHcloud
```

---

## ⚠️ IMPORTANTE

1. **Attendi propagazione DNS** (5-30 minuti)
2. **Verifica SSL mode**: "Full" o "Full (strict)"
3. **Controlla Firewall Hetzner**: Assicurati che accetti connessioni da Cloudflare

### Firewall Hetzner (se necessario):
```bash
# Sul server Hetzner
ufw allow from 173.245.48.0/20
ufw allow from 103.21.244.0/22
ufw allow from 103.22.200.0/22
ufw allow from 103.31.4.0/22
ufw allow from 141.101.64.0/18
ufw allow from 108.162.192.0/18
ufw allow from 190.93.240.0/20
ufw allow from 188.114.96.0/20
ufw allow from 197.234.240.0/22
ufw allow from 198.41.128.0/17
ufw allow from 162.158.0.0/15
ufw allow from 104.16.0.0/13
ufw allow from 104.24.0.0/14
ufw allow from 172.64.0.0/13
ufw allow from 131.0.72.0/22
```

---

## 🚀 DOPO LA CONFIGURAZIONE

1. **Test accesso**: https://agenziecase.com
2. **Test HTTPS**: Dovresti vedere il certificato SSL di Cloudflare
3. **Test backend**: https://agenziecase.com/api/health
4. **Verifica logs**: Cloudflare dovrebbe mostrare traffico

---

## 🆘 SE ANCORA NON FUNZIONA

### 1. Verifica stato Cloudflare:
- Dashboard → Overview → Vedi se ci sono errori

### 2. Controlla SSL/TLS:
- SSL/TLS → Edge Certificates → Certificato deve essere "Active"

### 3. Verifica Origin Server:
- Il server Hetzner (178.104.183.66) deve rispondere su porta 80
- Cloudflare si connette all'origine su porta 80

### 4. Test diretto bypassando Cloudflare:
```bash
# Modifica hosts file temporaneamente
echo "178.104.183.66 agenziecase.com" >> /etc/hosts
curl http://agenziecase.com
```

---

## ✅ COMPLETATO

Quando vedi `Server: cloudflare` nelle response headers, la configurazione è completa!

*Ultimo aggiornamento: 18 Aprile 2026*