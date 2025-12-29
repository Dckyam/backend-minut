const express = require('express');
const router = express.Router();
const simrsController = require('../controllers/simrsController');
const simrsUsersController = require('../controllers/simrsUsersController');
const menuAccessController = require('../controllers/menuAccessController');
const authMiddleware = require('../middleware/auth');

/**
 * PRODUCTION ENDPOINT - NO AUTH (temporary while debugging auth issue)
 * @route   GET /api/simrs/menu-access-no-auth/:nama
 * @desc    Get menu access by nama user WITHOUT authentication (temporary)
 */
router.get('/menu-access-no-auth/:nama', async (req, res) => {
  try {
    const { nama } = req.params;
    console.log('[Menu Access No Auth] Getting menu for user:', nama);

    const db = require('../database/db');
    const result = await db.query('SELECT * FROM menu_access WHERE nama = $1', [nama]);

    if (!result.rows[0]) {
      // User not found - return default inactive
      return res.json({
        success: true,
        message: 'User not found',
        data: {
          nama: nama,
          is_active: 0,
          menu: [],
          submenu: []
        }
      });
    }

    const menuAccess = result.rows[0];

    // If user is inactive, return empty menu
    if (menuAccess.is_active === 0) {
      return res.json({
        success: true,
        message: 'User is inactive',
        data: {
          nama: menuAccess.nama,
          is_active: 0,
          menu: [],
          submenu: []
        }
      });
    }

    // Return active user menu
    res.json({
      success: true,
      message: 'Menu access retrieved successfully',
      data: {
        nama: menuAccess.nama,
        is_active: menuAccess.is_active,
        menu: menuAccess.menu || [],
        submenu: menuAccess.submenu || []
      }
    });
  } catch (error) {
    console.error('[Menu Access No Auth] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Apply auth middleware to all routes AFTER test endpoint
router.use(authMiddleware);

/**
 * @route   GET /api/simrs/transaksi/:noReg
 * @desc    Get transaksi SIMRS by no_registrasi (dengan parameter URL)
 * @access  Protected (JWT required)
 */
router.get('/transaksi/:noReg', simrsController.getTransaksi);

/**
 * @route   GET /api/simrs/transaksi
 * @desc    Get transaksi SIMRS by no_registrasi (dengan query string ?no_reg=xxx)
 * @access  Protected (JWT required)
 */
router.get('/transaksi', simrsController.getTransaksi);

/**
 * @route   GET /api/simrs/summary/:noReg
 * @desc    Get summary transaksi SIMRS by no_registrasi (dengan parameter URL)
 * @access  Protected (JWT required)
 */
router.get('/summary/:noReg', simrsController.getSummary);

/**
 * @route   GET /api/simrs/summary
 * @desc    Get summary transaksi SIMRS by no_registrasi (dengan query string ?no_reg=xxx)
 * @access  Protected (JWT required)
 */
router.get('/summary', simrsController.getSummary);

/**
 * SIMRS Users Route
 * Untuk mendapatkan list users dari SIMRS untuk menu access
 */

/**
 * @route   GET /api/simrs/users/for-menu-access
 * @desc    Get users list for menu access (hanya nama_asli)
 * @access  Protected (JWT required)
 */
router.get('/users/for-menu-access', simrsUsersController.getUsersForMenuAccess);

/**
 * @route   GET /api/simrs/icd10
 * @desc    Get ICD10 data
 * @access  Protected (JWT required)
 */
router.get('/icd10', simrsController.getICD10);

module.exports = router;
