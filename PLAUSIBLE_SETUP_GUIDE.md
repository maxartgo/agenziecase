# 📊 Plausible Analytics Setup

## 📋 Overview

Plausible Analytics è configurato per agenziecase.com come soluzione analytics:
- ✅ **Privacy-focused** (no cookies di tracciamento)
- ✅ **GDPR compliant** (nessun dato personale raccolto)
- ✅ **Leggero** (< 1KB vs Google Analytics 45KB)
- ✅ **Open Source**
- ✅ **Dashboard pulito** e semplice

---

## ✅ Componenti Configurati

### Frontend
- **File**: `index.html`
- **Script**: Plausible tagged events
- **Dominio**: agenziecase.com
- **Features**:
  - Page views automatici
  - Event tracking personalizzati
  - File download tracking
  - 404 error tracking
  - Outbound link tracking

---

## 🔑 Configurazione Plausible

### 1. Crea account Plausible
Vai su: https://plausible.io/

### 2. Aggiungi il tuo dominio
1. Clicca "Add a website"
2. Inserisci: `agenziecase.com`
3. Verifica il dominio (aggiungi record DNS)

### 3. Verifica lo script
Nel codice del sito è già presente:
```html
<script defer data-domain="agenziecase.com" src="https://plausible.io/js/script.tagged-events.js"></script>
```

---

## 🚀 Verifica Funzionamento

### Test locale
1. Apri il sito: https://agenziecase.com
2. Vai su Plausible dashboard
3. Dovresti vedere page views

### Test eventi personalizzati
```javascript
// In qualsiasi componente React:
window.plausible('trackGoal', { goal: 'Signup' });
window.plausible('trackEvent', { name: 'button_click' });
```

---

## 📊 Dashboard Plausible

Dopo la configurazione, avrai accesso a:

### Metriche Principali
- **Unique Visitors**: Visitatori unici
- **Pageviews**: Visualizzazioni pagine
- **Bounce Rate**: % che esce subito
- **Visit Duration**: Tempo medio sul sito
- **Referrers**: Da dove arrivano i visitatori
- **Pages**: Pagine più visitate

### Metriche Avanzate
- **Exit Pages**: Pagine da cui escono
- **Entry Pages**: Pagine di ingresso
- **Countries**: Geolocalizzazione
- **Devices**: Desktop/Mobile
- **Browsers:** Chrome, Firefox, Safari

---

## 🎯 Eventi Custom Consigliati

Per il portale immobiliare, puoi tracciare:

```javascript
// Property views
plausible('trackEvent', { name: 'property_view', props: { property_id: 123 } });

// Contact form submissions
plausible('trackGoal', { goal: 'contact_form_submit' });

// Search queries
plausible('trackEvent', { name: 'search', props: { query: 'Milano' } });

// Favorite property
plausible('trackEvent', { name: 'add_favorite', props: { property_id: 123 } });

// Agent registration
plausible('trackGoal', { goal: 'agent_registration' });
```

---

## 🔧 Troubleshooting

### Non vedo dati su Plausible
1. Verifica che lo script sia in index.html
2. Verifica che il dominio sia corretto: `agenziecase.com`
3. Attendi 5-10 minuti per il primo dato
4. Controlla che non ci siano adblocker attivi

### Dati non aggiornati
- Plausible aggiorna i dati ogni 5 minuti
- I dati di oggi sono in tempo reale

### Dominio non verificato
Segui le istruzioni su Plausible per aggiungere il record DNS.

---

## 📈 Impostazioni Privacy

Plausible è:
- ✅ **Senza cookie di tracciamento**
- ✅ **Senza dati personali**
- ✅ **Conforme al GDPR**
- ✅ **Open source self-hosted option**

---

## 🎁 Benefici vs Google Analytics

| Caratteristica | Plausible | Google Analytics |
|----------------|-----------|-------------------|
| GDPR Compliant | ✅ Sì | ❌ No (richiede consenso) |
| Cookie banner | ❌ Non necessario | ⚠️ Richiesto |
| Peso script | ~1KB | ~45KB |
| Privacy | ✅ Massima | ⚠️ Limitata |
| Dashboard | ✅ Semplice | ❌ Complesso |
| Open Source | ✅ Sì | ❌ No |

---

## 📞 Risorse

- **Dashboard**: https://plausible.io/
- **Documentazione**: https://plausible.io/docs/
- **Blog**: https://plausible.io/blog/

---

**Creato:** 2026-05-07
**Stato:** ⏳ Da configurare (manca verifica dominio su Plausible)
