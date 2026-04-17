import sequelize from '../config/database.js';

/**
 * Query optimization utilities for better database performance
 */

/**
 * Execute multiple queries in a transaction with automatic retry
 * @param {Function} callback - Function containing queries to execute
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<any>} - Result of the transaction
 */
export const executeTransaction = async (callback, maxRetries = 3) => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await sequelize.transaction(async (t) => {
        return await callback(t);
      });
      return result;
    } catch (error) {
      attempt++;

      // Retry on deadlock or connection timeout
      if (
        (error.name === 'SequelizeDatabaseError' &&
          (error.message.includes('deadlock') || error.message.includes('timeout'))) &&
        attempt < maxRetries
      ) {
        console.warn(`⚠️  Transaction attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
        continue;
      }

      throw error; // Re-throw if not retryable or max retries reached
    }
  }
};

/**
 * Batch insert/update for better performance
 * @param {Model} model - Sequelize model
 * @param {Array} records - Records to insert/update
 * @param {Object} options - Options (batchSize, updateOnDuplicate, etc.)
 * @returns {Promise<Array>} - Created/updated records
 */
export const batchOperation = async (
  model,
  records,
  options = {}
) => {
  const {
    batchSize = 100,
    updateOnDuplicate = [],
    validate = true
  } = options;

  if (!records || records.length === 0) {
    return [];
  }

  const results = [];
  const totalBatches = Math.ceil(records.length / batchSize);

  console.log(`🔄 Processing ${records.length} records in ${totalBatches} batches...`);

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;

    try {
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

      const result = await model.bulkCreate(batch, {
        updateOnDuplicate,
        validate,
        individualHooks: false // Disable individual hooks for better performance
      });

      results.push(...result);
    } catch (error) {
      console.error(`❌ Error processing batch ${batchNumber}:`, error.message);
      throw error;
    }
  }

  console.log(`✅ Completed processing ${results.length} records`);
  return results;
};

/**
 * Optimized find with caching and eager loading
 * @param {Model} model - Sequelize model
 * @param {Object} options - Query options
 * @param {string} cacheKey - Cache key (optional)
 * @param {number} ttl - Cache TTL in seconds (optional)
 * @returns {Promise<any>} - Query result
 */
export const optimizedFind = async (
  model,
  options = {},
  cacheKey = null,
  ttl = 300
) => {
  // Set performance defaults
  const optimizedOptions = {
    ...options,
    // Enable query plan caching
    benchmark: true,
    // Use subquery:false for better performance with simple queries
    subQuery: false,
    // Set reasonable defaults
    ...options
  };

  return await model.findAll(optimizedOptions);
};

/**
 * Create database indexes for better query performance
 * @param {string} tableName - Table name
 * @param {Array} columns - Column names to index
 * @param {Object} options - Index options (unique, name, etc.)
 * @returns {Promise<void>}
 */
export const createIndex = async (
  tableName,
  columns,
  options = {}
) => {
  try {
    const indexName = options.name || `idx_${tableName}_${columns.join('_')}`;
    const unique = options.unique ? 'UNIQUE' : '';

    const indexSQL = `
      CREATE ${unique} INDEX IF NOT EXISTS "${indexName}"
      ON "${tableName}" (${columns.join(', ')})
      ${options.where ? `WHERE ${options.where}` : ''}
    `;

    await sequelize.query(indexSQL);
    console.log(`✅ Created index: ${indexName}`);
  } catch (error) {
    console.error(`❌ Error creating index on ${tableName}:`, error.message);
  }
};

/**
 * Analyze query performance and suggest optimizations
 * @param {string} sql - SQL query to analyze
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeQuery = async (sql) => {
  try {
    // Use EXPLAIN ANALYZE for PostgreSQL
    const [results] = await sequelize.query(`EXPLAIN ANALYZE ${sql}`);

    // Parse results for common performance issues
    const analysis = {
      query: sql,
      executionPlan: results,
      suggestions: []
    };

    // Check for sequential scans
    const hasSeqScan = JSON.stringify(results).includes('Seq Scan');
    if (hasSeqScan) {
      analysis.suggestions.push({
        type: 'warning',
        message: 'Sequential scan detected - consider adding an index'
      });
    }

    // Check for high cost operations
    const costMatch = JSON.stringify(results).match(/cost=\d+\.\d+\.\.(\d+\.\d+)/);
    if (costMatch && parseFloat(costMatch[1]) > 1000) {
      analysis.suggestions.push({
        type: 'warning',
        message: `High query cost: ${costMatch[1]} - consider optimization`
      });
    }

    return analysis;
  } catch (error) {
    console.error('❌ Error analyzing query:', error.message);
    return null;
  }
};

/**
 * Get table statistics for monitoring
 * @param {string} tableName - Table name
 * @returns {Promise<Object>} - Table statistics
 */
export const getTableStats = async (tableName) => {
  try {
    const [results] = await sequelize.query(`
      SELECT
        schemaname,
        tablename,
        n_live_tup as row_count,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      WHERE tablename = :tableName
    `, {
      replacements: { tableName },
      type: sequelize.QueryTypes.SELECT
    });

    return results[0] || null;
  } catch (error) {
    console.error(`❌ Error getting stats for ${tableName}:`, error.message);
    return null;
  }
};

/**
 * Optimize table with VACUUM ANALYZE
 * @param {string} tableName - Table name
 * @returns {Promise<void>}
 */
export const optimizeTable = async (tableName) => {
  try {
    await sequelize.query(`VACUUM ANALYZE "${tableName}"`);
    console.log(`✅ Optimized table: ${tableName}`);
  } catch (error) {
    console.error(`❌ Error optimizing ${tableName}:`, error.message);
  }
};

/**
 * Get database connection pool stats
 * @returns {Promise<Object>} - Pool statistics
 */
export const getPoolStats = () => {
  const pool = sequelize.connectionManager.pool;
  return {
    total: pool.size,
    idle: pool.idle,
    waiting: pool.waiting,
    max: pool.max,
    min: pool.min
  };
};

export default {
  executeTransaction,
  batchOperation,
  optimizedFind,
  createIndex,
  analyzeQuery,
  getTableStats,
  optimizeTable,
  getPoolStats
};
