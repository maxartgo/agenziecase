# Google Cloud Text-to-Speech Setup

## Perché Google Cloud TTS invece di ElevenLabs?

- **Costo**: Google offre 1 milione di caratteri GRATIS al mese, poi solo $4 per milione
- **ElevenLabs**: Solo 10.000 caratteri gratis/mese, poi $5-99/mese
- **Risparmio**: ~25x più economico con qualità simile

## Setup Rapido (5 minuti)

### 1. Crea Account Google Cloud

1. Vai su https://console.cloud.google.com/
2. Accedi con il tuo account Google
3. Clicca "Crea progetto" (o usa uno esistente)
   - Nome progetto: `agenziecase-tts` (o quello che preferisci)

### 2. Abilita Text-to-Speech API

1. Nella console, cerca "Text-to-Speech API"
2. Clicca "ABILITA"
3. Attendi 1-2 minuti per l'attivazione

### 3. Crea Credenziali

#### Opzione A: File JSON (più semplice per sviluppo locale)

1. Vai su "Credenziali" nel menu laterale
2. Clicca "CREA CREDENZIALI" > "Account di servizio"
3. Nome account: `tts-service`
4. Clicca "CREA E CONTINUA"
5. Ruolo: "Proprietario del progetto" (o "Editor")
6. Clicca "CONTINUA" e "FINE"
7. Clicca sull'account di servizio appena creato
8. Vai alla scheda "CHIAVI"
9. Clicca "AGGIUNGI CHIAVE" > "Crea nuova chiave"
10. Scegli formato JSON
11. Scarica il file JSON

**Aggiungi al file `.env`:**
```env
GOOGLE_APPLICATION_CREDENTIALS=./server/google-cloud-key.json
```

Poi sposta il file JSON scaricato in `server/google-cloud-key.json`

#### Opzione B: Credenziali Inline (migliore per deployment su Heroku/Vercel)

Apri il file JSON scaricato e copia i valori nel `.env`:

```env
GOOGLE_CLOUD_PROJECT_ID=il-tuo-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=tts-service@il-tuo-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nLa tua chiave privata qui\n-----END PRIVATE KEY-----\n"
```

**IMPORTANTE**: La chiave privata deve includere `\n` per le newline.

### 4. Test

Riavvia il server e prova la funzionalità vocale nell'app!

## Costi e Limiti

| Piano | Caratteri/mese | Costo |
|-------|----------------|-------|
| **Gratis** | 1.000.000 | $0 |
| Oltre limite | Per milione | $4 |

**Esempio pratico:**
- 1 risposta media: ~200 caratteri
- Piano gratis: 5.000 risposte vocali/mese
- Se superi: 10.000 risposte = $8/mese

Confronto con ElevenLabs ($5/mese per 30k char = 150 risposte):
- **Google Cloud**: 5.000 risposte GRATIS vs 150 risposte a pagamento

## Voci Disponibili

Le voci italiane WaveNet (alta qualità, naturali):

- `it-IT-Wavenet-A`: Voce femminile
- `it-IT-Wavenet-B`: Voce femminile giovane ✅ (quella che usiamo)
- `it-IT-Wavenet-C`: Voce maschile
- `it-IT-Wavenet-D`: Voce maschile

## Risoluzione Problemi

### Errore: "PERMISSION_DENIED"
- Verifica che la Text-to-Speech API sia abilitata
- Controlla che le credenziali siano corrette
- Assicurati che l'account di servizio abbia i permessi necessari

### Errore: "RESOURCE_EXHAUSTED"
- Hai superato il limite mensile di 1M caratteri
- Aspetta il prossimo mese o abilita la fatturazione

### Audio non si riproduce
- Controlla i log del server per errori
- Verifica che il browser supporti MP3
- Prova a ricaricare la pagina

## Note Tecniche

- **Formato audio**: MP3 @ 24kHz
- **Latenza**: ~1-2 secondi (simile a ElevenLabs)
- **Qualità**: WaveNet è molto naturale, quasi indistinguibile da voce umana
- **Preprocessing**: Il testo viene pre-processato per migliorare la pronuncia di numeri e abbreviazioni
