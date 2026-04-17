// Environment Variables Validation
import dotenv from 'dotenv';

dotenv.config();

/**
 * Schema validazione environment variables
 */
const requiredEnvVars = {
  // Database
  DB_NAME: process.env.DB_NAME || 'agenziecase',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'admin123',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 5432,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Server
  PORT: parseInt(process.env.PORT) || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // API Keys
  GROQ_API_KEY: process.env.GROQ_API_KEY,

  // Redis (optional)
  REDIS_URL: process.env.REDIS_URL,

  // Email (optional)
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM
};

/**
 * Valida che tutte le variabili environment richieste siano presenti
 */
export const validateEnvVariables = () => {
  const errors = [];
  const warnings = [];

  // Variabili obbligatorie per produzione
  if (process.env.NODE_ENV === 'production') {
    if (!requiredEnvVars.JWT_SECRET || requiredEnvVars.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET deve essere almeno 32 caratteri in produzione');
    }

    if (!requiredEnvVars.GROQ_API_KEY) {
      errors.push('GROQ_API_KEY è obbligatorio in produzione');
    }

    // Database non dovrebbe usare default in produzione
    if (process.env.DB_PASSWORD === 'admin123') {
      warnings.push('Stai usando la password default del database in produzione!');
    }
  }

  // Variabili obbligatorie sempre
  if (!requiredEnvVars.JWT_SECRET) {
    errors.push('JWT_SECRET è obbligatorio');
  }

  // Validazioni formato
  if (requiredEnvVars.JWT_SECRET && requiredEnvVars.JWT_SECRET.length < 16) {
    errors.push('JWT_SECRET deve essere almeno 16 caratteri');
  }

  if (requiredEnvVars.DB_PORT && (requiredEnvVars.DB_PORT < 1 || requiredEnvVars.DB_PORT > 65535)) {
    errors.push('DB_PORT deve essere tra 1 e 65535');
  }

  if (requiredEnvVars.PORT && (requiredEnvVars.PORT < 1 || requiredEnvVars.PORT > 65535)) {
    errors.push('PORT deve essere tra 1 e 65535');
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment Variable Warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Log errors e blocca avvio se critico
  if (errors.length > 0) {
    console.error('❌ Environment Variable Errors:');
    errors.forEach(error => console.error(`   - ${error}`));

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment variables non valide. Impossibile avviare il server in produzione.');
    } else {
      console.warn('⚠️  Server avviato in development con errori ENV (non consigliato per produzione)');
    }
  }

  // Log successo
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Environment variables validate');
  }
};

/**
 * Get config object
 */
export const getConfig = () => {
  return {
    ...requiredEnvVars,
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  };
};

export default getConfig;
