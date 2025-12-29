
const express = require('express');
const router = express.Router();
const menuAccessController = require('../controllers/menuAccessController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * =================================================================
 * GET ROUTES - Read menu access data
 * =================================================================
 */

/**
 * @route   GET /api/menu-access
 * @desc    Get all menu access (for User Access Management page)
 * @access  Protected (JWT required)
 */
router.get('/', async (req, res) => {
  try {
    console.log('[Menu Access] Getting all users');

    const db = require('../database/db');
    const result = await db.query(`
      SELECT
        id, nama, is_active, menu, submenu,
        created_by, created_date, updated_by, updated_date
      FROM menu_access
      ORDER BY nama ASC
    `);

    res.json({
      success: true,
      message: 'All menu access retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('[Menu Access] Error getting all users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/menu-access/:nama
 * @desc    Get menu access by nama user
 * @access  Protected (JWT required)
 */
router.get('/:nama', async (req, res) => {
  try {
    const { nama } = req.params;
    console.log('[Menu Access] Getting menu for user:', nama);

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
    console.error('[Menu Access] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * =================================================================
 * POST ROUTES - Create menu access
 * =================================================================
 */

/**
 * @route   POST /api/menu-access
 * @desc    Create new menu access (user account)
 * @access  Protected (JWT required)
 * @body    { nama: string (nama_asli from SIMRS), is_active: 0|1, menu: [], submenu: [] }
 *
 * Workflow:
 * 1. Di extension, user search nama dari API /api/simrs/users/for-menu-access
 * 2. Pilih nama_asli dari hasil search
 * 3. POST ke endpoint ini dengan nama tersebut
 * 4. Nanti bisa mapping menu dengan checkbox di extension
 */
router.post('/', async (req, res) => {
  try {
    const { nama, is_active = 1, menu = [], submenu = [], created_by } = req.body;

    // Use created_by from request body first, then JWT username, then fallback to 'system'
    const createdBy = created_by || req.user?.username || 'system';

    console.log('[Menu Access] Creating new user:', nama, 'by:', createdBy);

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: 'Nama user is required'
      });
    }

    const db = require('../database/db');

    // Check if user already exists
    const existing = await db.query('SELECT id FROM menu_access WHERE nama = $1', [nama]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User sudah terdaftar dalam sistem menu access'
      });
    }

    // Create new user
    const result = await db.query(`
      INSERT INTO menu_access (nama, is_active, menu, submenu, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [nama, is_active, menu, submenu, createdBy]);

    res.status(201).json({
      success: true,
      message: 'Menu access created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Menu Access] Error creating user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * =================================================================
 * PUT/PATCH ROUTES - Update menu access
 * =================================================================
 */

/**
 * @route   PUT /api/menu-access/:id
 * @desc    Update menu access
 * @access  Protected (JWT required)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, is_active, menu, submenu, updated_by } = req.body;

    // Use updated_by from request body first, then JWT username, then fallback to 'system'
    const updatedBy = updated_by || req.user?.username || 'system';

    console.log('[Menu Access] Updating user:', id, 'by:', updatedBy);

    const db = require('../database/db');

    // Check if changing nama to existing nama
    if (nama) {
      const existing = await db.query(
        'SELECT id FROM menu_access WHERE nama = $1 AND id != $2',
        [nama, id]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Nama user sudah digunakan oleh user lain'
        });
      }
    }

    const result = await db.query(`
      UPDATE menu_access
      SET
        nama = COALESCE($2, nama),
        is_active = COALESCE($3, is_active),
        menu = COALESCE($4, menu),
        submenu = COALESCE($5, submenu),
        updated_by = $6,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, nama, is_active, menu, submenu, updatedBy]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu access not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu access updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Menu Access] Error updating user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/menu-access/:id/map-menu
 * @desc    Mapping menu dan submenu ke user access
 * @access  Protected (JWT required)
 * @body    { menu: [array of menu IDs], submenu: [array of submenu IDs] }
 *
 * Workflow untuk extension:
 * 1. Load data menu yang sudah ada dari API
 * 2. Tampilkan checkbox untuk setiap menu
 * 3. User checklist menu yang ingin diberikan akses
 * 4. PATCH ke endpoint ini dengan array menu dan submenu IDs
 */
router.patch('/:id/map-menu', async (req, res) => {
  try {
    const { id } = req.params;
    const { menu = [], submenu = [] } = req.body;
    const updated_by = req.user?.username || 'system';

    const db = require('../database/db');
    const result = await db.query(`
      UPDATE menu_access
      SET menu = $2, submenu = $3, updated_by = $4, updated_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, menu, submenu, updated_by]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu access not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu mapping updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Menu Access] Error mapping menu:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/menu-access/:id/deactivate
 * @desc    Deactivate user (set is_active = 0)
 * @access  Protected (JWT required)
 */
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const updated_by = req.user?.username || 'system';

    console.log('[Menu Access] Deactivating user:', id);

    const db = require('../database/db');

    const result = await db.query(`
      UPDATE menu_access
      SET
        is_active = 0,
        updated_by = $2,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, updated_by]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu access not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Menu Access] Error deactivating user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/menu-access/:id/activate
 * @desc    Activate user (set is_active = 1)
 * @access  Protected (JWT required)
 */
router.patch('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const updated_by = req.user?.username || 'system';

    console.log('[Menu Access] Activating user:', id);

    const db = require('../database/db');

    const result = await db.query(`
      UPDATE menu_access
      SET
        is_active = 1,
        updated_by = $2,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, updated_by]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu access not found'
      });
    }

    res.json({
      success: true,
      message: 'User activated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Menu Access] Error activating user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * =================================================================
 * DELETE ROUTES - Delete menu access
 * =================================================================
 */

/**
 * @route   DELETE /api/menu-access/:id
 * @desc    Delete menu access (permanent delete)
 * @access  Protected (JWT required)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[Menu Access] Deleting user:', id);

    const db = require('../database/db');

    const result = await db.query('DELETE FROM menu_access WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu access not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu access deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Menu Access] Error deleting user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
