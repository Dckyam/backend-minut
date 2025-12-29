const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Login endpoint
router.post('/login', authController.login);

// Verify token endpoint (optional, untuk testing)
router.get('/verify', authController.verify);

module.exports = router;
