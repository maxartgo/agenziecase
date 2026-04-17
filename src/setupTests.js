// Vitest setup file for React Testing Library
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock SpeechSynthesisUtterance for voice tests
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.voice = null;
    this.lang = 'it-IT';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.onend = null;
    this.onerror = null;
  }
};

// Mock Web Speech API
class MockSpeechRecognition {
  constructor() {
    this.lang = 'it-IT';
    this.continuous = false;
    this.interimResults = false;
    this.onresult = null;
    this.onend = null;
    this.onerror = null;
  }

  start() {
    // Simula risultato dopo breve delay
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
    if (this.onend) {
      this.onend();
    }
  }

  abort() {
    // Do nothing
  }
}

global.SpeechRecognition = MockSpeechRecognition;
global.webkitSpeechRecognition = MockSpeechRecognition;

// Mock fetch
global.fetch = vi.fn();

// Mock SpeechSynthesis for voice tests
global.speechSynthesis = {
  speaking: false,
  pending: false,
  getVoices: vi.fn(() => [
    { name: 'Google Italiano', lang: 'it-IT' },
    { name: 'Microsoft Elsa', lang: 'it-IT' },
    { name: 'Alice', lang: 'it-IT' },
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Microsoft David', lang: 'it-IT' }
  ]),
  speak: vi.fn(),
  cancel: vi.fn(),
  onvoiceschanged: null
};

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
};

// Mock window.confirm
global.confirm = vi.fn(() => true);
