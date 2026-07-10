const Menu = require('../models/Menu');

/**
 * Service managing database operations and business logic for the Menu model.
 */
class MenuService {
  /**
   * Helper to retrieve a single active menu item by ID.
   */
  async findMenuById(id) {
    return await Menu.findOne({ _id: id, isDeleted: false });
  }

  /**
   * Escapes special regex characters in a string to prevent ReDoS attacks.
   * @param {string} str - Raw user input.
   * @returns {string} Escaped string safe for RegExp constructor.
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Checks if a menu item with the same name already exists.
   */
  async checkDuplicateName(name, excludeId = null) {
    const query = {
      name: { $regex: new RegExp(`^${this.escapeRegex(name.trim())}$`, 'i') },
      isDeleted: false
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return await Menu.findOne(query);
  }

  /**
   * Creates a new menu item, checking for name duplicates.
   */
  async createMenuItem(menuData) {
    const { name } = menuData;

    // Rule: Duplicate menu item names are forbidden
    const duplicate = await this.checkDuplicateName(name);
    if (duplicate) {
      const err = new Error(`A menu item named "${name}" already exists.`);
      err.statusCode = 409;
      throw err;
    }

    const menuItem = new Menu(menuData);
    return await menuItem.save();
  }

  /**
   * Fetches paginated, searched, filtered, and sorted active menu items.
   */
  async getMenuPaginated({
    page = 1,
    limit = 10,
    search,
    category,
    isAvailable,
    isFeatured,
    sort = 'createdAt',
    order = 'desc'
  }) {
    const filterQuery = { isDeleted: false };

    // Search logic (name, description, ingredients)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filterQuery.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { ingredients: searchRegex } // MongoDB matches regex against elements in array
      ];
    }

    // Filter by category
    if (category) {
      filterQuery.category = category;
    }

    // Filter by availability
    if (isAvailable !== undefined) {
      filterQuery.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    // Filter by featured status
    if (isFeatured !== undefined) {
      filterQuery.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    // Sort setup
    const sortField = ['price', 'createdAt'].includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortQuery = { [sortField]: sortOrder };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    const [data, totalDocuments] = await Promise.all([
      Menu.find(filterQuery)
        .sort(sortQuery)
        .skip(skipNum)
        .limit(limitNum),
      Menu.countDocuments(filterQuery)
    ]);

    const totalPages = Math.ceil(totalDocuments / limitNum);

    return {
      totalDocuments,
      currentPage: pageNum,
      totalPages,
      data
    };
  }

  /**
   * Fetch a single active menu item.
   */
  async getMenuItemById(id) {
    return await this.findMenuById(id);
  }

  /**
   * Updates an existing menu item, dynamically recalculating slug if name changes.
   */
  async updateMenuItem(id, updateData) {
    const menuItem = await this.findMenuById(id);
    if (!menuItem) return null;

    // Rule: Duplicate menu item names are forbidden
    if (updateData.name && updateData.name.trim().toLowerCase() !== menuItem.name.toLowerCase()) {
      const duplicate = await this.checkDuplicateName(updateData.name, id);
      if (duplicate) {
        const err = new Error(`A menu item named "${updateData.name}" already exists.`);
        err.statusCode = 409;
        throw err;
      }
    }

    // Assign updates
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        menuItem[key] = updateData[key];
      }
    });

    return await menuItem.save();
  }

  /**
   * Updates availability status of a menu item.
   */
  async updateAvailability(id, isAvailable) {
    const menuItem = await this.findMenuById(id);
    if (!menuItem) return null;

    menuItem.isAvailable = isAvailable;
    return await menuItem.save();
  }

  /**
   * Updates featured status of a menu item.
   */
  async updateFeatured(id, isFeatured) {
    const menuItem = await this.findMenuById(id);
    if (!menuItem) return null;

    menuItem.isFeatured = isFeatured;
    return await menuItem.save();
  }

  /**
   * Soft deletes a menu item.
   */
  async softDeleteMenuItem(id) {
    const menuItem = await this.findMenuById(id);
    if (!menuItem) return null;

    menuItem.isDeleted = true;
    return await menuItem.save();
  }
}

module.exports = new MenuService();
