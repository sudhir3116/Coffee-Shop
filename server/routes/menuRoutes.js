const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const {
  createMenuValidator,
  updateMenuValidator,
  updateAvailabilityValidator,
  updateFeaturedValidator,
  idParamValidator
} = require('../validators/menuValidator');

// POST /api/menu - Add a new menu item
router.post('/', createMenuValidator, menuController.createMenuItem);

// GET /api/menu - Fetch paginated, sorted, filtered menu items
router.get('/', menuController.getAllMenuItems);

// GET /api/menu/:id - Fetch single menu item by ID
router.get('/:id', idParamValidator, menuController.getMenuItemById);

// PATCH /api/menu/:id - Update menu item details
router.patch('/:id', updateMenuValidator, menuController.updateMenuItem);

// PATCH /api/menu/:id/availability - Toggle item availability status
router.patch('/:id/availability', updateAvailabilityValidator, menuController.updateAvailability);

// PATCH /api/menu/:id/featured - Toggle featured showcase status
router.patch('/:id/featured', updateFeaturedValidator, menuController.updateFeatured);

// DELETE /api/menu/:id - Soft-delete menu item
router.delete('/:id', idParamValidator, menuController.deleteMenuItem);

module.exports = router;
