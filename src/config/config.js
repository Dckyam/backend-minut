require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cibinong_db',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Auth Configuration
  auth: {
    username: process.env.AUTH_USERNAME || 'Sysdev@2025',
    password: process.env.AUTH_PASSWORD || 'Cibinong',
  },

  // Admedika Configuration
  admedika: {
    baseUrl: process.env.ADMEDIKA_BASE_URL || 'https://adcpslite.admedika.co.id:553/admedgateway/services/customerhost_dev',
    customerID: process.env.ADMEDIKA_CUSTOMER_ID || '0383',
    securityWord: process.env.ADMEDIKA_SECURITY_WORD || 'I want to break free',
    terminalID: process.env.ADMEDIKA_TERMINAL_ID || '12372351',
  },
};

module.exports = config;
