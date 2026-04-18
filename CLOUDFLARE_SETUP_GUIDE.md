# 🚀 CLOUDFLARE SSL - GUIDA PASSO PASSO

## 📋 INDICE
1. [Crea Account Cloudflare](#1-crea-account-cloudflare)
2. [Aggiungi Dominio](#2-aggiungi-dominio)
3. [Configura DNS](#3-configura-dns)
4. [Aggiorna Nameserver OVH](#4-aggiorna-nameserver-ovh)
5. [Attiva SSL](#5-attiva-ssl)
6. [Verifica Funzionamento](#6-verifica-funzionamento)

---

## 1. CREA ACCOUNT CLOUDFLARE

### 1.1 Registrazione
1. Vai su **https://dash.cloudflare.com/sign-up**
2. Inserisci **email**
3. Inserisci **password**
4. Clicca **"Crea Account"**

### 1.2 Verifica Email
1. Controlla la tua email
2. Clicca sul link di verifica
3. Accedi al pannello Cloudflare

---

## 2. AGGIUNGI DOMINIO

### 2.1 Aggiungi Sito
1. Clicca **"Add a Site"** o **"Aggiungi un sito"**
2. Inserisci il dominio: **agenziecase.com**
3. Clicca **"Add site"** o **"Aggiungi sito"**

### 2.2 Scegli Piano
1. Seleziona **"Free"** (Gratuito)
2. Clicca **"Continue"**

### 2.3 Scan DNS Automatico
Cloudflare scansionerà automaticamente i record DNS esistenti.

---

## 3. CONFIGURA DNS

Cloudflare dovrebbe trovare automaticamente questi record:

### 3.1 Record DNS Necessari:
```
TYPE    NAME            CONTENT         PROXY   TTL
A       agenziecase.com 178.104.183.66  ON      Auto
A       www             178.104.183.66  ON      Auto
```

### 3.2 Se Non Trova Automaticamente:
1. Clicca **"Add Record"**
2. Aggiungi manualmente:

**Record 1:**
- Type: **A**
- Name: **agenziecase.com** (o **@**)
- IPv4: **178.104.183.66**
- Proxy: **ON** (nuvola arancione)
- TTL: **Auto**

**Record 2:**
- Type: **A**
- Name: **www**
- IPv4: **178.104.183.66**
- Proxy: **ON** (nuvola arancione)
- TTL: **Auto**

3. Clicca **"Save"** per ogni record

4. Clicca **"Continue"**

---

## 4. AGGIORNIA NAMESERVER OVH

### 4.1 Copia Nameserver Cloudflare
Cloudflare ti mostrerà 2 nameserver tipo:
```
lara.ns.cloudflare.com
wesley.ns.cloudflare.com
```

### 4.2 Vai su OVH
1. Accedi a **https://www.ovh.com/auth**
2. Vai a **Domini** → **agenziecase.com**
3. Clicca su tab **"Server DNS"** o **"Nameserver"**

### 4.3 Cambia Nameserver
1. Seleziona **"Personali"** o **"Custom"**
2. Rimuovi i nameserver attuali OVH
3. Aggiungi i 2 nameserver Cloudflare:
   - **lara.ns.cloudflare.com**
   - **wesley.ns.cloudflare.com**
4. Clicca **"Salva"** o **"Conferma"**

### 4.4 Torna su Cloudflare
1. Clicca **"Done, check nameservers"**
2. Cloudflare verificherà i nameserver

⏰ **ATTENDI 15-30 MINUTI** per la propagazione DNS.

---

## 5. ATTIVA SSL

### 5.1 Configura SSL/TLS
1. Nel pannello Cloudflare, vai su **SSL/TLS**
2. Seleziona modalità: **"Flexible"** o **"Full"**

**Consiglio**: Inizia con **"Flexible"** (più semplice)

### 5.2 Imposta Always HTTPS
1. Nella sezione **Edge Certificates**
2. Attiva **"Always Use HTTPS"** → **ON**
3. Attiva **"Automatic HTTPS Rewrites"** → **ON**

### 5.3 Altre Impostazioni Raccomandate:
- **Minimum TLS Version**: **1.2**
- **Opportunistic Encryption**: **ON**
- **TLS 1.3**: **ON**
- **Universal SSL**: **Active** (gratuito)

---

## 6. VERIFICA FUNZIONAMENTO

### 6.1 Aspetta Propagazione
Attendi **15-30 minuti** per:
- Propagazione DNS
- Attivazione SSL Cloudflare
- Verifica dominio

### 6.2 Test HTTPS
Apri il browser e vai su:
- **https://agenziecase.com**
- **https://www.agenziecase.com**

Dovresti vedere:
- 🔒 **Lucchetto verde** nella barra indirizzi
- ✅ **Nessun avviso di sicurezza**
- 🌐 **Sito caricato correttamente**

### 6.3 Test Redirect
- Vai su **http://agenziecase.com**
- Dovrebbe redirect automatico a **https://agenziecase.com**

---

## 🎉 RISULTATO FINALE

### ✅ Cosa Ottieni:
- 🔒 **SSL Gratuito** (valido, riconosciuto dai browser)
- 🌐 **Nessun avviso di sicurezza**
- 🚀 **CDN inclusa** (sito più veloce)
- 🛡️ **Protezione DDoS**
- ⚡ **Cache ottimizzata**
- 📊 **Analytics gratuito**
- 🔥 **Firewall applicazione**

### 🌐 Accessi:
- **Frontend**: https://agenziecase.com
- **API**: https://agenziecase.com/api
- **Admin**: https://agenziecase.com/admin

---

## 🛠️ TROUBLESHOOTING

### Problema: Sito non raggiungibile
**Soluzione**: Attendi ancora 15-30 minuti per propagazione DNS

### Problema: SSL non attivo
**Soluzione**:
1. Verifica che "Always Use HTTPS" sia ON
2. Controlla che i nameserver siano corretti su OVH
3. Attendi 10-15 minuti per attivazione SSL Cloudflare

### Problema: API non funziona
**Soluzione**:
1. Vai su Cloudflare → SSL/TLS
2. Cambia da "Flexible" a **"Full"**
3. Attendi 5 minuti

### Problema: ERROR 521/522
**Soluzione**:
1. Verifica che l'IP del server sia corretto (178.104.183.66)
2. Controlla che il firewall permetta connessioni da Cloudflare
3. Verifica che i container siano running

---

## 📞 SUPPORTO

Se hai problemi durante la configurazione:
1. Controlla lo stato su Cloudflare Dashboard
2. Verifica i nameserver su OVH
3. Controlla i logs del server
4. Contattami per assistenza

---

**Tempo totale stimato**: 20-30 minuti ⏱️
**Difficoltà**: Facile 🟢
**Costo**: GRATUITO 🆓