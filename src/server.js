const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config/config');

const authRoutes = require('./routes/auth');
const admedikaRoutes = require('./routes/admedika');
const simrsRoutes = require('./routes/simrs');
const menuAccessRoutes = require('./routes/menuAccess');
const extensionUpdateRoutes = require('./routes/extensionUpdateRoutes');

// Initialize SIMRS database connection pool
const dbSimrs = require('./database/dbSimrs');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins including moz-extension://
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files (for extension downloads)
app.use(express.static(path.join(__dirname, '../public')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Pendaftaran Cibinong API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admedika', admedikaRoutes);
app.use('/api/simrs', simrsRoutes);
app.use('/api/menu-access', menuAccessRoutes);
app.use('/api/extension/updates', extensionUpdateRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: config.server.env === 'development' ? err.stack : undefined
  });
});

// Start server
async function startServer() {
  try {
    // Wait untuk database siap
    console.log('⏳ Waiting for database connection...');
    const db = require('./database/db');

    // Test database connection
    let retries = 5;
    while (retries > 0) {
      try {
        await db.query('SELECT 1');
        console.log('✅ Database connection successful');
        break;
      } catch (error) {
        retries--;
        console.log(`⚠️  Database connection failed, retries left: ${retries}`);
        if (retries === 0) {
          throw new Error('Could not connect to database after 5 retries');
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Start server
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${config.server.env}`);
      console.log(`📊 Database: ${config.database.database}`);
      console.log('=================================');
      console.log('Available endpoints:');
      console.log('');
      console.log('🔐 Authentication:');
      console.log(`  POST   http://localhost:${PORT}/api/auth/login`);
      console.log('');
      console.log('👥 SIMRS Users (for Menu Access):');
      console.log(`  GET    http://localhost:${PORT}/api/simrs/users/for-menu-access`);
      console.log(`  GET    http://localhost:${PORT}/api/simrs/users?search=...`);
      console.log(`  GET    http://localhost:${PORT}/api/simrs/users/:loginId`);
      console.log('');
      console.log('🔑 Menu Access:');
      console.log(`  GET    http://localhost:${PORT}/api/menu-access`);
      console.log(`  GET    http://localhost:${PORT}/api/menu-access/:nama`);
      console.log(`  POST   http://localhost:${PORT}/api/menu-access`);
      console.log(`  PATCH  http://localhost:${PORT}/api/menu-access/:id/map-menu`);
      console.log('');
      console.log('📊 SIMRS Transaksi:');
      console.log(`  GET    http://localhost:${PORT}/api/simrs/transaksi/:noReg`);
      console.log('');
      console.log('🏥 Admedika:');
      console.log(`  GET    http://localhost:${PORT}/api/admedika/coverage-types`);
      console.log(`  POST   http://localhost:${PORT}/api/admedika/eligibility`);
      console.log(`  POST   http://localhost:${PORT}/api/admedika/discharge-op`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
