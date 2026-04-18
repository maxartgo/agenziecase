import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';

/**
 * Custom hook per gestire Voice AI
 * - Speech-to-Text: Web Speech API (gratis)
 * - Text-to-Speech: Google Cloud TTS API
 */
export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const voicesRef = useRef([]);

  // Inizializza Speech Recognition
  useEffect(() => {
    // Controlla supporto browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Il tuo browser non supporta il riconoscimento vocale. Usa Chrome, Edge o Safari.');
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Crea istanza Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.continuous = false; // Fermati dopo una frase
    recognition.interimResults = false; // Solo risultati finali

    // Gestisci risultato
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
    };

    // Gestisci fine ascolto
    recognition.onend = () => {
      setIsListening(false);
    };

    // Gestisci errori
    recognition.onerror = (event) => {
      console.error('Errore speech recognition:', event.error);

      let errorMessage = `Errore: ${event.error}`;

      // Messaggi specifici per errori comuni
      if (event.error === 'not-allowed') {
        errorMessage = 'Microfono bloccato. Vai su impostazioni browser > privacy > microfono > permetti a agenziecase.com';
      } else if (event.error === 'no-speech') {
        errorMessage = 'Nessun parlato rilevato. Prova di nuovo.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Microfono non disponibile o in uso da un\'altra app.';
      }

      setError(errorMessage);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Pre-carica voci TTS
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      voicesRef.current = voices;

      if (voices.length > 0) {
        console.log('🎤 Voci caricate:', voices.length);
        setVoicesLoaded(true);
      }
    };

    // Carica voci immediatamente
    loadVoices();

    // Ascolta caricamento voci (alcuni browser le caricano async)
    window.speechSynthesis.onvoiceschanged = () => {
      console.log('🔄 Voci cambiate, ricarico...');
      loadVoices();
    };

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /**
   * Avvia ascolto voce (Speech-to-Text)
   */
  const startListening = () => {
    if (!isSupported) {
      setError('Riconoscimento vocale non supportato');
      return;
    }

    setError(null);
    setTranscript('');
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Errore avvio recognition:', err);
      setIsListening(false);
      setError('Impossibile avviare il microfono');
    }
  };

  /**
   * Ferma ascolto voce
   */
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  /**
   * Seleziona voce femminile italiana
   */
  const getItalianFemaleVoice = () => {
    const voices = voicesRef.current;

    if (!voices || voices.length === 0) {
      console.warn('⚠️ Nessuna voce disponibile');
      return null;
    }

    // Filtra voci italiane
    let italianVoices = voices.filter(voice =>
      voice.lang.startsWith('it-') || voice.lang.startsWith('it_')
    );

    console.log('🇮🇹 Voci italiane trovate:', italianVoices.length);

    // ESCLUDI esplicitamente voci maschili
    const malePatterns = [
      'male', 'maschio', 'david', 'marco', 'paolo', 'luca', 'andrea',
      'stefano', 'alessandro', 'francesco', 'lorenzo', 'mattia', 'riccardo',
      'simone', 'federico', 'nicola', 'giovanni', 'matteo'
    ];

    const nonMaleVoices = italianVoices.filter(voice =>
      !malePatterns.some(pattern =>
        voice.name.toLowerCase().includes(pattern)
      )
    );

    console.log('🚫 Voci maschie escluse:', italianVoices.length - nonMaleVoices.length);

    if (nonMaleVoices.length > 0) {
      italianVoices = nonMaleVoices;
    }

    if (italianVoices.length === 0) {
      console.warn('⚠️ Nessuna voce italiana trovata');
      return null;
    }

    // Cerca voci femminili italiane
    const femaleVoice = italianVoices.find(voice =>
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('femmina') ||
      voice.name.toLowerCase().includes('donna') ||
      voice.name.toLowerCase().includes('isabella') ||
      voice.name.toLowerCase().includes('eleonor') ||
      voice.name.toLowerCase().includes('sophie') ||
      voice.name.toLowerCase().includes('alice') ||
      voice.name.toLowerCase().includes('maria') ||
      voice.name.toLowerCase().includes('lucia') ||
      voice.name.toLowerCase().includes('giulia') ||
      voice.name.toLowerCase().includes('francesca') ||
      voice.name.toLowerCase().includes('aria') ||
      voice.name.toLowerCase().includes('elena')
    ) || italianVoices.find(voice =>
      voice.name.includes('Google') && voice.lang.startsWith('it')
    ) || italianVoices.find(voice =>
      voice.name.includes('Microsoft') && voice.lang.startsWith('it')
    ) || italianVoices[0];

    console.log('✅ Voce selezionata:', femaleVoice.name, `(${femaleVoice.lang})`);
    return femaleVoice;
  };

  /**
   * Parla testo (Text-to-Speech con Google Cloud TTS)
   * @param {string} text - Testo da leggere
   * @param {boolean} useBrowserTTS - Se true usa browser TTS (gratis) invece di Google Cloud TTS
   */
  const speak = async (text, useBrowserTTS = false) => {
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ speak(): testo vuoto');
      return;
    }

    // Pulisci il testo da Markdown, emoji e tronca a 950 caratteri
    let cleanText = text
      // Rimuovi emoji
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')        // Emoji comuni
      .replace(/[\u{2600}-\u{26FF}]/gu, '')          // Simboli vari
      .replace(/[\u{2700}-\u{27BF}]/gu, '')          // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')          // Varianti
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')        // Emoticon
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')        // Trasporti
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')        // Bandiere
      // Rimuovi Markdown (prima Bold per evitare conflitti)
      .replace(/\*\*(.+?)\*\*/g, '$1')               // Bold **testo**
      .replace(/\*(.+?)\*/g, '$1')                   // Italic *testo*
      .replace(/___(.+?)___/g, '$1')                 // Bold italic ___testo___
      .replace(/__(.+?)__/g, '$1')                   // Bold __testo__
      .replace(/_(.+?)_/g, '$1')                     // Italic _testo_
      .replace(/~~(.+?)~~/g, '$1')                   // Strike-through ~~testo~~
      .replace(/`(.+?)`/g, '$1')                     // Inline code `testo`
      .replace(/```[\s\S]*?```/g, '')                // Code blocks
      .replace(/#+\s/g, '')                          // Headers #, ##, ###
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')       // Link [testo](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')      // Immagini
      .replace(/^\s*[-*+]\s/gm, '')                  // Liste - * +
      .replace(/^\s*\d+\.\s/gm, '')                  // Liste numerate 1. 2.
      .replace(/\|/g, '')                            // Tabelle |
      .replace(/^>+\s/gm, '')                        // Blockquote >
      // Rimuovi caratteri speciali rimasti
      .replace(/[*_~`#|]/g, '')                      // Caratteri speciali singoli
      .replace(/\n+/g, '. ')                         // Newline → punto
      .replace(/\s+/g, ' ')                          // Spazi multipli
      .replace(/\.\s*\./g, '.')                      // Doppi puntini
      .trim();

    // Tronca a 950 caratteri per sicurezza (max backend 1000)
    if (cleanText.length > 950) {
      // Tronca alla fine della frase più vicina
      cleanText = cleanText.substring(0, 950);
      const lastPeriod = Math.max(
        cleanText.lastIndexOf('.'),
        cleanText.lastIndexOf('!'),
        cleanText.lastIndexOf('?')
      );
      if (lastPeriod > 400) {
        cleanText = cleanText.substring(0, lastPeriod + 1);
      } else {
        cleanText = cleanText.substring(0, 950) + '...';
      }
    }

    console.log('🔊 speak() chiamato con:', {
      originalLength: text.length,
      cleanLength: cleanText.length,
      text: cleanText.substring(0, 50) + '...',
      useBrowserTTS
    });

    setError(null);
    setIsSpeaking(true);

    try {
      // Opzione 1: Browser TTS migliorato (gratis, voce femminile)
      if (useBrowserTTS) {
        console.log('🗣️ Usando Browser TTS migliorato');

        // Aspetta che le voci siano caricate (max 3 secondi)
        let attempts = 0;
        const maxAttempts = 30; // 3 secondi

        while (!voicesLoaded && voicesRef.current.length === 0 && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        const femaleVoice = getItalianFemaleVoice();

        if (!femaleVoice) {
          console.error('❌ Nessuna voce italiana disponibile');
          setError('Nessuna voce italiana disponibile');
          setIsSpeaking(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = femaleVoice; // IMPOSTA LA VOCE PRIMA DI ALTRI PARAMETRI
        utterance.lang = 'it-IT';
        utterance.rate = 0.95; // Velocità naturale (1.0 = normale)
        utterance.pitch = 1.0; // Tono normale

        console.log('✅ Voce femminile impostata:', femaleVoice.name);

        utterance.onend = () => {
          console.log('✅ Browser TTS completato');
          setIsSpeaking(false);
        };
        utterance.onerror = (e) => {
          console.error('❌ Errore Browser TTS:', e);
          setError('Errore sintesi vocale');
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      }
      // Opzione 2: Google Cloud TTS (qualità alta, voce naturale)
      else {
        console.log('🎤 Chiamata Google Cloud TTS API...');
        // Chiama backend
        const response = await fetch(`${API_BASE_URL}/api/voice/text-to-speech`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText })
        });

        console.log('📡 Risposta API:', response.status, response.ok);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Errore API:', errorData);
          throw new Error(errorData.error || 'Errore generazione audio');
        }

        // Ottieni audio blob
        const audioBlob = await response.blob();
        console.log('📦 Audio blob ricevuto:', audioBlob.size, 'bytes');

        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('🔗 Audio URL creato:', audioUrl);

        // Play audio
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          console.log('📊 Metadata caricati - Durata:', audio.duration, 's');
        };

        audio.oncanplaythrough = () => {
          console.log('✅ Audio pronto per riproduzione');
        };

        audio.onplay = () => {
          console.log('▶️ Riproduzione iniziata');
        };

        audio.onended = () => {
          console.log('✅ Riproduzione completata');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = (e) => {
          console.error('❌ Errore riproduzione audio:', e);
          console.error('Audio error details:', audio.error);
          setError('Errore riproduzione audio');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        console.log('▶️ Avvio play()...');
        await audio.play();
        console.log('✅ play() eseguito');
      }
    } catch (err) {
      console.error('❌ Errore speak:', err);
      setError(err.message || 'Errore sintesi vocale');
      setIsSpeaking(false);
    }
  };

  /**
   * Ferma riproduzione audio
   */
  const stopSpeaking = () => {
    // Ferma browser TTS
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Ferma Google Cloud TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSpeaking(false);
  };

  return {
    // Stati
    isListening,
    isSpeaking,
    transcript,
    error,
    isSupported,

    // Funzioni
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
};
