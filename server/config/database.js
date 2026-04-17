import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Slow query logging configuration
const SLOW_QUERY_THRESHOLD = process.env.NODE_ENV === 'production' ? 500 : 100; // ms

// Custom logging function for slow queries
const logSlowQuery = (sql, timing) => {
  if (timing > SLOW_QUERY_THRESHOLD) {
    console.warn(`⚠️  SLOW QUERY (${timing}ms):`, sql);
  }
};

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'agenziecase',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  dialect: 'postgres',
  logging: (sql, timing) => {
    if (process.env.NODE_ENV === 'development') {
      logSlowQuery(sql, timing);
    } else if (timing > SLOW_QUERY_THRESHOLD) {
      logSlowQuery(sql, timing);
    }
  },
  benchmark: true, // Enable query timing
  pool: {
    max: 25,              // Increased from 5 for better concurrency
    min: 5,               // Maintain minimum connections
    acquire: 30000,       // Maximum time (ms) to get connection
    idle: 10000,          // Maximum time (ms) connection can be idle
    evict: 60000,         // Run eviction every 60 seconds
    handleDisconnects: true // Handle pool disconnects
  }
});

// Test connessione
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connessione al database PostgreSQL stabilita con successo!');
    return true;
  } catch (error) {
    console.error('❌ Impossibile connettersi al database:', error.message);
    return false;
  }
};

export default sequelize;
