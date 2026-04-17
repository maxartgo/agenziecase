// Test setup file - runs before each test file
import { jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME_TEST || 'agenziecase_test';

// Mock console methods to reduce noise in tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging test failures
  // error: console.error,
};

// Mock external services
jest.mock('@google-cloud/text-to-speech', () => ({
  TextToSpeechClient: jest.fn().mockImplementation(() => ({
    synthesizeSpeech: jest.fn().mockResolvedValue([{ audioContent: 'mock-audio' }])
  }))
}));

jest.mock('@elevenlabs/elevenlabs-js', () => ({
  ElevenLabsClient: jest.fn().mockImplementation(() => ({
    textToSpeech: {
      generate: jest.fn().mockResolvedValue({ audio: 'mock-audio' })
    }
  }))
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' })
  })
}));

// Mock Redis (optional, if you want to test without Redis)
jest.mock('../config/redis.js', () => ({
  connectRedis: jest.fn().mockResolvedValue(),
  disconnectRedis: jest.fn().mockResolvedValue(),
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(),
  invalidateCache: jest.fn().mockResolvedValue()
}));

// Mock Cloudinary (optional)
jest.mock('../config/cloudinary.js', () => ({
  uploadImage: jest.fn().mockResolvedValue({
    secure_url: 'https://mock-cloudinary.com/image.jpg',
    public_id: 'mock-public-id'
  })
}));
