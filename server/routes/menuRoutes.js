const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const {
  createMenuValidator,
  updateMenuValidator,
  updateAvailabilityValidator,
  updateFeaturedValidator,
  idParamValidator
} = require('../validators/menuValidator');

// POST /api/menu - Add a new menu item (admin only)
router.post('/', protect, createMenuValidator, menuController.createMenuItem);

// GET /api/menu - Fetch paginated, sorted, filtered menu items (public)
router.get('/', menuController.getAllMenuItems);

// GET /api/menu/:id - Fetch single menu item by ID (public)
router.get('/:id', idParamValidator, menuController.getMenuItemById);

// PATCH /api/menu/:id - Update menu item details (admin only)
router.patch('/:id', protect, updateMenuValidator, menuController.updateMenuItem);

// PATCH /api/menu/:id/availability - Toggle item availability status (admin only)
router.patch('/:id/availability', protect, updateAvailabilityValidator, menuController.updateAvailability);

// PATCH /api/menu/:id/featured - Toggle featured showcase status (admin only)
router.patch('/:id/featured', protect, updateFeaturedValidator, menuController.updateFeatured);

// DELETE /api/menu/:id - Soft-delete menu item (admin only)
router.delete('/:id', protect, idParamValidator, menuController.deleteMenuItem);

module.exports = router;
