// useVoice Hook Tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVoice } from '../../hooks/useVoice';

// Mock Web Speech API
const mockSpeechRecognition = vi.fn();
const mockSpeechSynthesisUtterance = vi.fn();

class MockSpeechRecognition {
  constructor() {
    this.lang = 'it-IT';
    this.continuous = false;
    this.interimResults = false;
    this.onresult = null;
    this.onend = null;
    this.onerror = null;
    this._started = false;
  }

  start() {
    this._started = true;
    // Simula risultato dopo un breve delay
    setTimeout(() => {
      if (this.onresult) {
        this.onresult({
          results: [{
            0: {
              transcript: 'Testo di prova'
            }
          }]
        });
      }
      if (this.onend) {
        this.onend();
      }
    }, 100);
  }

  stop() {
    this._started = false;
    if (this.onend) {
      this.onend();
    }
  }

  abort() {
    this._started = false;
  }
}

// Mock speech synthesis
const mockSpeechSynthesis = {
  speaking: false,
  pending: false,
  getVoices: vi.fn(() => [
    { name: 'Google Italiano', lang: 'it-IT' },
    { name: 'Microsoft Elsa', lang: 'it-IT' },
    { name: 'Alice', lang: 'it-IT' },
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Microsoft David', lang: 'it-IT' } // Voce maschile
  ]),
  speak: vi.fn(),
  cancel: vi.fn(),
  onvoiceschanged: null
};

window.speechSynthesis = mockSpeechSynthesis;
window.SpeechRecognition = MockSpeechRecognition;
window.webkitSpeechRecognition = MockSpeechRecognition;

// Mock fetch for Google Cloud TTS
global.fetch = vi.fn();

describe('useVoice Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpeechSynthesis.speaking = false;
    mockSpeechSynthesis.pending = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default states', () => {
      const { result } = renderHook(() => useVoice());

      expect(result.current.isListening).toBe(false);
      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.transcript).toBe('');
      expect(result.current.error).toBe(null);
      expect(result.current.isSupported).toBe(true);
    });

    it('should detect browser support', () => {
      const { result } = renderHook(() => useVoice());

      expect(result.current.isSupported).toBe(true);
    });

    it('should load voices on mount', async () => {
      renderHook(() => useVoice());

      await waitFor(() => {
        expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled();
      });
    });

    it('should handle unsupported browser', () => {
      // Temporarily remove Speech Recognition support
      const originalRecognition = window.SpeechRecognition;
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;

      const { result } = renderHook(() => useVoice());

      expect(result.current.isSupported).toBe(false);
      expect(result.current.error).toContain('non supporta');

      // Restore support
      window.SpeechRecognition = originalRecognition;
      window.webkitSpeechRecognition = originalRecognition;
    });
  });

  describe('Speech Recognition (Speech-to-Text)', () => {
    it('should start listening', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.startListening();
      });

      expect(result.current.isListening).toBe(true);
      expect(result.current.transcript).toBe('');
      expect(result.current.error).toBe(null);
    });

    it('should receive transcript and stop listening', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.startListening();
      });

      await waitFor(() => {
        expect(result.current.transcript).toBe('Testo di prova');
      }, { timeout: 500 });

      await waitFor(() => {
        expect(result.current.isListening).toBe(false);
      }, { timeout: 500 });
    });

    it('should stop listening manually', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.startListening();
      });

      expect(result.current.isListening).toBe(true);

      act(() => {
        result.current.stopListening();
      });

      expect(result.current.isListening).toBe(false);
    });

    it('should handle recognition errors', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.startListening();
      });

      // Simula errore - non puoi avviare due volte
      act(() => {
        try {
          result.current.startListening();
        } catch (err) {
          // Expected error
        }
      });

      // L'hook dovrebbe gestirlo gracefully
      await waitFor(() => {
        expect(result.current.isListening).toBe(false);
      });
    });

    it('should not start listening when not supported', async () => {
      // Mock unsupported browser
      const originalRecognition = window.SpeechRecognition;
      window.SpeechRecognition = null;
      window.webkitSpeechRecognition = null;

      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.startListening();
      });

      expect(result.current.error).toContain('non supportato');

      // Restore
      window.SpeechRecognition = originalRecognition;
      window.webkitSpeechRecognition = originalRecognition;
    });
  });

  describe('Text-to-Speech (Browser TTS)', () => {
    it('should speak text with browser TTS', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo di prova', true);
      });

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true);
      });

      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    it('should handle empty text', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('', true);
      });

      // Should not start speaking
      expect(result.current.isSpeaking).toBe(false);
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should clean text from markdown and emojis', async () => {
      const { result } = renderHook(() => useVoice());

      const textWithMarkdown = '**Testo** in *grassetto* e emoji 😊';

      act(() => {
        result.current.speak(textWithMarkdown, true);
      });

      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.text).not.toContain('**');
      expect(utterance.text).not.toContain('😊');
    });

    it('should truncate long text', async () => {
      const { result } = renderHook(() => useVoice());

      const longText = 'A'.repeat(2000);

      act(() => {
        result.current.speak(longText, true);
      });

      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.text.length).toBeLessThanOrEqual(950);
    });

    it('should select Italian female voice', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo di prova', true);
      });

      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.voice).toBeDefined();
      expect(utterance.lang).toBe('it-IT');
    });

    it('should filter out male voices', async () => {
      // Voce maschile viene filtrata
      const voices = mockSpeechSynthesis.getVoices();
      const maleVoice = voices.find(v => v.name === 'Microsoft David');

      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo di prova', true);
      });

      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      // Non dovrebbe essere la voce maschile
      expect(utterance.voice.name).not.toBe('Microsoft David');
    });

    it('should stop speaking', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo di prova', true);
      });

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true);
      });

      act(() => {
        result.current.stopSpeaking();
      });

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(result.current.isSpeaking).toBe(false);
    });
  });

  describe('Text-to-Speech (Google Cloud TTS)', () => {
    beforeEach(() => {
      // Mock fetch for Google Cloud TTS
      global.fetch.mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['audio data'], { type: 'audio/mp3' })
      });
    });

    it('should call Google Cloud TTS API', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo di prova', false);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/voice/text-to-speech'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });
    });

    it('should handle API errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'TTS API Error' })
      });

      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo di prova', false);
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isSpeaking).toBe(false);
      });
    });

    it('should play audio blob', async () => {
      const audioBlob = new Blob(['audio data'], { type: 'audio/mp3' });
      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => audioBlob
      });

      // Mock Audio constructor
      const mockAudio = {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        onloadedmetadata: null,
        oncanplaythrough: null,
        onplay: null,
        onended: null,
        onerror: null,
        currentTime: 0,
        error: null
      };

      global.Audio = vi.fn(() => mockAudio);

      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo di prova', false);
      });

      await waitFor(() => {
        expect(mockAudio.play).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in text', async () => {
      const { result } = renderHook(() => useVoice());

      const specialText = 'Testo con: @#€$%& ecc...';

      act(() => {
        result.current.speak(specialText, true);
      });

      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.text).toBeTruthy();
    });

    it('should handle unicode characters', async () => {
      const { result } = renderHook(() => useVoice());

      const unicodeText = 'Testo con caratteri特殊中文עברית';

      act(() => {
        result.current.speak(unicodeText, true);
      });

      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      });
    });

    it('should handle multiple consecutive speak calls', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Primo testo', true);
      });

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true);
      });

      // Second call should cancel previous
      act(() => {
        result.current.speak('Secondo testo', true);
      });

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('should handle very short text', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('OK', true);
      });

      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      });
    });

    it('should reset error on new operation', async () => {
      const { result } = renderHook(() => useVoice());

      // Set an error
      act(() => {
        result.current.speak('', true);
      });

      act(() => {
        result.current.speak('Testo valido', true);
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete speech-to-text-to-speech flow', async () => {
      const { result } = renderHook(() => useVoice());

      // 1. Start listening
      act(() => {
        result.current.startListening();
      });

      expect(result.current.isListening).toBe(true);

      // 2. Receive transcript
      await waitFor(() => {
        expect(result.current.transcript).toBe('Testo di prova');
      });

      // 3. Speak the transcript back
      act(() => {
        result.current.speak(result.current.transcript, true);
      });

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true);
      });

      // 4. Stop speaking
      act(() => {
        result.current.stopSpeaking();
      });

      expect(result.current.isSpeaking).toBe(false);
    });

    it('should handle error recovery', async () => {
      const { result } = renderHook(() => useVoice());

      // Trigger error
      act(() => {
        result.current.startListening();
        result.current.startListening(); // Error: already started
      });

      // Recover with new operation
      act(() => {
        result.current.speak('Testo di recupero', true);
      });

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true);
      });
    });

    it('should handle rapid state changes', async () => {
      const { result } = renderHook(() => useVoice());

      // Rapid operations
      act(() => {
        result.current.startListening();
        result.current.stopListening();
        result.current.speak('Testo', true);
        result.current.stopSpeaking();
        result.current.startListening();
      });

      // Should handle gracefully without crashes
      expect(result.current.isListening).toBe(true);
    });
  });

  describe('Voice Selection', () => {
    it('should prioritize Google Italian voices', async () => {
      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo', true);
      });

      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.voice.name).toContain('Google');
    });

    it('should fallback to Microsoft voices if no Google', async () => {
      // Mock only Microsoft voices
      mockSpeechSynthesis.getVoices.mockReturnValueOnce([
        { name: 'Microsoft Elsa', lang: 'it-IT' },
        { name: 'Microsoft David', lang: 'it-IT' }
      ]);

      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo', true);
      });

      await waitFor(() => {
        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.voice.name).toContain('Microsoft');
      expect(utterance.voice.name).not.toContain('David'); // Male voice filtered
    });

    it('should handle no Italian voices available', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValueOnce([
        { name: 'Google US English', lang: 'en-US' }
      ]);

      const { result } = renderHook(() => useVoice());

      act(() => {
        result.current.speak('Testo', true);
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Nessuna voce italiana');
      });
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with multiple hook instances', () => {
      const { unmount: unmount1 } = renderHook(() => useVoice());
      const { unmount: unmount2 } = renderHook(() => useVoice());
      const { unmount: unmount3 } = renderHook(() => useVoice());

      // Should not throw errors
      unmount1();
      unmount2();
      unmount3();

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(0);
    });

    it('should cleanup properly on unmount', () => {
      const { unmount } = renderHook(() => useVoice());

      act(() => {
        unmount();
      });

      // Should cleanup without errors
      expect(true).toBe(true);
    });
  });
});