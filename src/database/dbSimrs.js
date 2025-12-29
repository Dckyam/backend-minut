const { Pool } = require('pg');

/**
 * PostgreSQL connection pool untuk SIMRS
 * Database: db_sentramedika di server SIMRS
 * Configuration from environment variables
 */
const poolSimrs = new Pool({
  host: process.env.SIMRS_DB_HOST,
  database: process.env.SIMRS_DB_NAME,
  user: process.env.SIMRS_DB_USER,
  password: process.env.SIMRS_DB_PASSWORD,
  port: parseInt(process.env.SIMRS_DB_PORT),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
poolSimrs.on('connect', () => {
  console.log(`✅ Connected to SIMRS PostgreSQL database (${process.env.SIMRS_DB_NAME} @ ${process.env.SIMRS_DB_HOST})`);
});

poolSimrs.on('error', (err) => {
  console.error('❌ Unexpected error on SIMRS database connection:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => poolSimrs.query(text, params),
  getClient: () => poolSimrs.connect(),
  pool: poolSimrs
};
