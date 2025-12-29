require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  // Auth Configuration
  auth: {
    username: process.env.AUTH_USERNAME,
    password: process.env.AUTH_PASSWORD,
  },

  // Admedika Configuration
  admedika: {
    baseUrl: process.env.ADMEDIKA_BASE_URL_PROD,
    customerID: process.env.ADMEDIKA_CUSTOMER_ID,
    securityWord: process.env.ADMEDIKA_SECURITY_WORD,
    terminalID: process.env.ADMEDIKA_TERMINAL_ID,
  },
};

module.exports = config;
