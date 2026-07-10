const menuService = require('../services/menuService');

/**
 * Controller handling request/response logic for Menu endpoints.
 */
class MenuController {
  /**
   * POST /api/menu
   * Creates a new menu item.
   */
  async createMenuItem(req, res) {
    try {
      const menuItem = await menuService.createMenuItem(req.body);

      return res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: menuItem
      });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message || 'Duplicate name detected'
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while creating menu item'
      });
    }
  }

  /**
   * GET /api/menu
   * Retrieves paginated, sorted, filtered, and searchable menu items.
   */
  async getAllMenuItems(req, res) {
    try {
      const { page, limit, search, category, isAvailable, isFeatured, sort, order } = req.query;
      const result = await menuService.getMenuPaginated({
        page,
        limit,
        search,
        category,
        isAvailable,
        isFeatured,
        sort,
        order
      });

      return res.status(200).json({
        success: true,
        totalDocuments: result.totalDocuments,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        data: result.data
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while retrieving menu items'
      });
    }
  }

  /**
   * GET /api/menu/:id
   * Retrieves a single menu item by ID.
   */
  async getMenuItemById(req, res) {
    try {
      const menuItem = await menuService.getMenuItemById(req.params.id);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Menu item retrieved successfully',
        data: menuItem
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while fetching menu item'
      });
    }
  }

  /**
   * PATCH /api/menu/:id
   * Updates an existing menu item. Recalculates slug if name is changed.
   */
  async updateMenuItem(req, res) {
    try {
      const menuItem = await menuService.updateMenuItem(req.params.id, req.body);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Menu item updated successfully',
        data: menuItem
      });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while updating menu item'
      });
    }
  }

  /**
   * PATCH /api/menu/:id/availability
   * Updates isAvailable state of a menu item.
   */
  async updateAvailability(req, res) {
    try {
      const { isAvailable } = req.body;
      const menuItem = await menuService.updateAvailability(req.params.id, isAvailable);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Availability status updated to ${isAvailable}`,
        data: menuItem
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while updating availability'
      });
    }
  }

  /**
   * PATCH /api/menu/:id/featured
   * Updates isFeatured state of a menu item.
   */
  async updateFeatured(req, res) {
    try {
      const { isFeatured } = req.body;
      const menuItem = await menuService.updateFeatured(req.params.id, isFeatured);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Featured status updated to ${isFeatured}`,
        data: menuItem
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while updating featured status'
      });
    }
  }

  /**
   * DELETE /api/menu/:id
   * Soft deletes a menu item.
   */
  async deleteMenuItem(req, res) {
    try {
      const menuItem = await menuService.softDeleteMenuItem(req.params.id);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Menu item deleted successfully',
        data: menuItem
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while deleting menu item'
      });
    }
  }
}

module.exports = new MenuController();
