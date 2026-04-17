import express from 'express';
import textToSpeech from '@google-cloud/text-to-speech';

const router = express.Router();

// Inizializza Google Cloud TTS client
// Configurazione credenziali Google Cloud
const clientConfig = {};

// Metodo 1: Se hai file JSON delle credenziali
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  clientConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}
// Metodo 2: Credenziali inline (migliore per deployment)
else if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
  // Converti correttamente la chiave privata con nuove righe
  let privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;

  console.log('🔑 Chiave privata caricata:', {
    length: privateKey.length,
    firstChars: privateKey.substring(0, 50),
    containsBackslashN: privateKey.includes('\\n'),
    containsDoubleBackslashN: privateKey.includes('\\\\n'),
    containsNewline: privateKey.includes('\n'),
    quotes: typeof privateKey
  });

  // Prova diverse conversioni
  if (privateKey.includes('\\n')) {
    console.log('🔄 Conversione backslash-n -> newline');
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  if (privateKey.includes('\\\\n')) {
    console.log('🔄 Conversione double-backslash-n -> newline');
    privateKey = privateKey.replace(/\\\\n/g, '\n');
  }

  console.log('🔑 Chiave dopo conversione:', {
    length: privateKey.length,
    containsNewline: privateKey.includes('\n'),
    lines: privateKey.split('\n').length
  });

  clientConfig.credentials = {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: privateKey
  };
  clientConfig.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
}
// Metodo 3: Usa Application Default Credentials (ADC) - funziona automaticamente su GCP
// Se nessuna credenziale è fornita, il client proverà ADC

const ttsClient = new textToSpeech.TextToSpeechClient(clientConfig);

// Funzione helper per convertire numeri grandi in parole italiane
function numberToWords(num) {
  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    const rest = num % 1000000;
    let result = millions === 1 ? 'un milione' : `${millions} milioni`;
    if (rest > 0) {
      if (rest >= 1000) {
        const thousands = Math.floor(rest / 1000);
        result += thousands === 1 ? ' e mille' : ` e ${thousands}mila`;
      }
    }
    return result;
  } else if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    return thousands === 1 ? 'mille' : `${thousands}mila`;
  }
  return num.toString();
}

// POST /api/voice/text-to-speech
// Converte testo in audio usando Google Cloud TTS
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Testo mancante' });
    }

    // Limita lunghezza per evitare costi eccessivi
    if (text.length > 1000) {
      return res.status(400).json({
        error: 'Testo troppo lungo. Massimo 1000 caratteri per risposta vocale.'
      });
    }

    console.log(`🎤 Generando audio per testo (${text.length} caratteri)...`);
    console.log(`📝 Testo originale: "${text}"`);

    // Pre-elabora il testo per migliorare la pronuncia
    let processedText = text
      // STEP 1: Rimuovi emoji e simboli Unicode non testuali
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')        // Emoji comuni (🏠, 💰, 🏖️, ecc.)
      .replace(/[\u{2600}-\u{26FF}]/gu, '')          // Simboli vari (☀️, ⭐, ecc.)
      .replace(/[\u{2700}-\u{27BF}]/gu, '')          // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')          // Varianti di presentazione
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')        // Emoticon
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')        // Trasporti e simboli
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')        // Bandiere
      // STEP 2: Rimuovi TUTTI i punti tra le cifre (più aggressivo)
      .replace(/(\d+)\.(\d+)/g, '$1$2')               // Rimuovi punti tra cifre
      .replace(/(\d+)\.(\d+)/g, '$1$2')               // Ripeti per catturare casi multipli
      .replace(/(\d+)\.(\d+)/g, '$1$2')               // Terza passata per sicurezza
      // STEP 3: Converti i numeri decimali con virgola (es: 15,25 → 15 virgola 25)
      .replace(/(\d+),(\d+)/g, '$1 virgola $2')       // 15,25 → 15 virgola 25
      // STEP 4: Pulisci spazi multipli e trim
      .replace(/\s+/g, ' ')                           // Rimuovi spazi multipli
      .trim();                                        // Rimuovi spazi iniziali/finali

    // Converti numeri grandi in parole (dopo aver rimosso i punti)
    processedText = processedText.replace(/(\d{4,})\s*euro/gi, (_match, number) => {
      const num = parseInt(number);
      return `${numberToWords(num)} euro`;
    });

    // Continua con le altre sostituzioni
    processedText = processedText
      // Sostituisci le abbreviazioni
      .replace(/(\d+)\s*mq\b/gi, '$1 metri quadri')   // 85 mq → 85 metri quadri
      .replace(/\bmq\b/gi, 'metri quadri')            // mq → metri quadri
      .replace(/(\d+)\s*m²\b/g, '$1 metri quadrati')  // 85 m² → 85 metri quadrati
      .replace(/\bm²\b/g, 'metri quadrati')           // m² → metri quadrati
      .replace(/\bkmq\b/gi, 'chilometri quadrati')    // kmq → chilometri quadrati
      .replace(/€\s?(\d+)/g, '$1 euro')               // €500 → 500 euro
      .replace(/(\d+)\s?€/g, '$1 euro')               // 500€ → 500 euro
      .replace(/\bvs\b/gi, 'versus')                  // vs → versus
      .replace(/\bes\./gi, 'esempio')                 // es. → esempio
      .replace(/\becc\./gi, 'eccetera')               // ecc. → eccetera
      .replace(/\bca\.\b/gi, 'circa')                 // ca. → circa
      .replace(/\bn\.\b/gi, 'numero')                 // n. → numero
      .replace(/\bpag\./gi, 'pagina')                 // pag. → pagina
      .replace(/\bcf\.\b/gi, 'codice fiscale')        // cf. → codice fiscale
      .replace(/\btel\./gi, 'telefono')               // tel. → telefono
      .replace(/\bmax\b/gi, 'massimo')                // max → massimo
      .replace(/\bmin\b/gi, 'minimo')                 // min → minimo
      .replace(/\bal mese\b/gi, 'al mese')            // mantieni "al mese"
      .replace(/\/mese\b/gi, ' al mese')              // /mese → al mese
      .replace(/\/anno\b/gi, ' all\'anno');           // /anno → all'anno

    console.log(`✅ Testo processato: "${processedText}"`);

    // Genera audio con Google Cloud TTS
    // Voce italiana WaveNet (qualità alta, naturale)
    // Opzioni voci italiane:
    // - it-IT-Wavenet-A: Voce femminile
    // - it-IT-Wavenet-B: Voce femminile (più giovane) ✅
    // - it-IT-Wavenet-C: Voce maschile
    // - it-IT-Wavenet-D: Voce maschile
    const request = {
      input: { text: processedText },
      voice: {
        languageCode: 'it-IT',
        name: 'it-IT-Wavenet-B', // Voce femminile giovane
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.92,  // Più lenta per chiarezza e completezza
        pitch: 0.0,
        volumeGainDb: 1.0,   // Leggermente più alto per compensare velocità ridotta
        sampleRateHertz: 24000
      }
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(request);
    const audioBuffer = Buffer.from(ttsResponse.audioContent, 'binary');

    // Invia audio come MP3
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=3600' // Cache per 1 ora
    });

    res.send(audioBuffer);
    console.log('✅ Audio generato con successo');

  } catch (error) {
    console.error('❌ Errore text-to-speech:', error);

    // Gestisci errori specifici Google Cloud
    if (error.code === 7) { // PERMISSION_DENIED
      return res.status(401).json({
        error: 'Autenticazione Google Cloud non configurata. Contatta il supporto.'
      });
    }

    if (error.code === 8) { // RESOURCE_EXHAUSTED (quota superata)
      return res.status(429).json({
        error: 'Limite mensile Google Cloud raggiunto. Riprova il prossimo mese.'
      });
    }

    if (error.message && error.message.includes('quota')) {
      return res.status(429).json({
        error: 'Limite quota raggiunto. Riprova più tardi.'
      });
    }

    res.status(500).json({
      error: 'Errore generazione audio',
      details: error.message || error.toString()
    });
  }
});

export default router;
