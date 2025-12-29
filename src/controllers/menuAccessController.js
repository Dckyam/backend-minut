const menuAccessService = require('../services/menuAccessService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class MenuAccessController {
  /**
   * @route   GET /api/simrs/menu-access/:nama
   * @desc    Get menu access by nama user
   * @access  Protected (JWT required)
   */
  getMenuAccessByNama = asyncHandler(async (req, res) => {
    const { nama } = req.params;

    const menuAccess = await menuAccessService.getMenuAccessByNama(nama);

    return successResponse(res, menuAccess, 'Menu access retrieved successfully');
  });

  /**
   * @route   GET /api/simrs/menu-access
   * @desc    Get menu access by nama user (via query string)
   * @access  Protected (JWT required)
   */
  getMenuAccessByQuery = asyncHandler(async (req, res) => {
    const { nama } = req.query;

    if (!nama) {
      return errorResponse(res, 'Nama user is required', 400);
    }

    const menuAccess = await menuAccessService.getMenuAccessByNama(nama);

    return successResponse(res, menuAccess, 'Menu access retrieved successfully');
  });

  /**
   * @route   GET /api/simrs/menu-access/all
   * @desc    Get all menu access (admin only)
   * @access  Protected (JWT required)
   */
  getAllMenuAccess = asyncHandler(async (req, res) => {
    const menuAccessList = await menuAccessService.getAllMenuAccess();

    return successResponse(res, menuAccessList, 'All menu access retrieved successfully');
  });

  /**
   * @route   POST /api/simrs/menu-access
   * @desc    Create new menu access
   * @access  Protected (JWT required)
   */
  createMenuAccess = asyncHandler(async (req, res) => {
    const { nama, is_active, menu, submenu } = req.body;

    // Get created_by from JWT token if available
    const created_by = req.user?.username || 'system';

    const newMenuAccess = await menuAccessService.createMenuAccess({
      nama,
      is_active,
      menu,
      submenu,
      created_by
    });

    return successResponse(res, newMenuAccess, 'Menu access created successfully', 201);
  });

  /**
   * @route   PUT /api/simrs/menu-access/:id
   * @desc    Update menu access
   * @access  Protected (JWT required)
   */
  updateMenuAccess = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nama, is_active, menu, submenu } = req.body;

    // Get updated_by from JWT token if available
    const updated_by = req.user?.username || 'system';

    const updatedMenuAccess = await menuAccessService.updateMenuAccess(id, {
      nama,
      is_active,
      menu,
      submenu,
      updated_by
    });

    return successResponse(res, updatedMenuAccess, 'Menu access updated successfully');
  });

  /**
   * @route   DELETE /api/simrs/menu-access/:id
   * @desc    Delete menu access
   * @access  Protected (JWT required)
   */
  deleteMenuAccess = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await menuAccessService.deleteMenuAccess(id);

    return successResponse(res, null, 'Menu access deleted successfully');
  });

  /**
   * @route   POST /api/simrs/menu-access/check
   * @desc    Check if user has access to specific menu
   * @access  Protected (JWT required)
   */
  checkMenuAccess = asyncHandler(async (req, res) => {
    const { nama, menuId } = req.body;

    const hasAccess = await menuAccessService.checkMenuAccess(nama, menuId);

    return successResponse(res, { hasAccess }, 'Menu access check completed');
  });
}

module.exports = new MenuAccessController();
