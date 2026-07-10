const mongoose = require('mongoose');

/**
 * @typedef {Object} Menu
 * @property {string} name - The unique name of the menu item (e.g., "Cappuccino").
 * @property {string} slug - The URL-friendly unique identifier generated from the name. Used for clean routing in frontend/API.
 * @property {string} description - A detailed description of the menu item (min 10 characters).
 * @property {string} category - The category classifying the menu item (e.g., Coffee, Tea).
 * @property {number} price - The price of the menu item (must be non-negative).
 * @property {string} currency - The currency unit for the price (defaults to "INR"). Provides standardization for pricing.
 * @property {string} image - The URL or file path to the item's image.
 * @property {string[]} ingredients - List of ingredients in the menu item.
 * @property {boolean} isAvailable - Availability status of the item.
 * @property {boolean} isFeatured - Whether the item is showcased in the featured section.
 * @property {boolean} isDeleted - Soft delete flag. Allows marking items as deleted without removing them permanently from the database.
 * @property {number} rating - The average rating of the menu item (0 - 5).
 * @property {number} totalReviews - The count of reviews received for the menu item.
 * @property {Date} createdAt - The timestamp when the menu item was created.
 * @property {Date} updatedAt - The timestamp when the menu item was last updated.
 */

/**
 * Menu Item Schema
 * Defines the structure, validations, and indexes for the menu items in the Coffee Shop application.
 */
const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Menu item name must be at least 2 characters long'],
      maxlength: [100, 'Menu item name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Menu item slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Menu item description is required'],
      trim: true,
      minlength: [10, 'Menu item description must be at least 10 characters long'],
      maxlength: [500, 'Menu item description cannot exceed 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Menu item category is required'],
      enum: {
        values: ['Coffee', 'Tea', 'Dessert', 'Snacks', 'Combo', 'Cold Beverage'],
        message: '{VALUE} is not a valid category'
      }
    },
    price: {
      type: Number,
      required: [true, 'Menu item price is required'],
      min: [0, 'Price must be a positive number or zero (0)']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: {
        values: ['INR'],
        message: 'Only INR currency is supported'
      }
    },
    image: {
      type: String,
      required: [true, 'Menu item image URL/path is required'],
      trim: true
    },
    ingredients: {
      type: [
        {
          type: String,
          trim: true
        }
      ],
      default: []
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews count cannot be negative']
    }
  },
  {
    timestamps: true,
    collection: 'menu'
  }
);

// Indexes for performance and uniqueness
menuSchema.index({ name: 1 }, { unique: true });
menuSchema.index({ slug: 1 }, { unique: true });
menuSchema.index({ category: 1 });

/**
 * Pre-validation middleware to automatically generate a unique slug from the menu item name.
 * Runs before mongoose validation to satisfy the required constraint on slug.
 */
menuSchema.pre('validate', async function (next) {
  // Only generate or update the slug if the name has been modified or if slug is not present
  if (this.isModified('name') || !this.slug) {
    if (!this.name) {
      return next(); // Skip slug generation if name is empty (validation will catch name requirement)
    }

    // Generate base slug: lowercase, replace spaces with hyphens, remove special characters, trim hyphens
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces/hyphens
      .replace(/\s+/g, '-')         // Replace one or more spaces with a hyphen
      .replace(/-+/g, '-')          // Replace multiple consecutive hyphens with a single hyphen
      .replace(/^-+|-+$/g, '');     // Trim leading/trailing hyphens

    let uniqueSlug = baseSlug;
    let slugExists = true;
    let attempts = 0;

    // Resolve duplicate slugs by appending a short random alphanumeric suffix
    while (slugExists && attempts < 10) {
      const existingDoc = await this.constructor.findOne({
        slug: uniqueSlug,
        _id: { $ne: this._id } // Exclude the current document if it is being updated
      });

      if (existingDoc) {
        const suffix = Math.random().toString(36).substring(2, 6); // 4-character random alphanumeric suffix
        uniqueSlug = `${baseSlug}-${suffix}`;
        attempts++;
      } else {
        slugExists = false;
      }
    }

    this.slug = uniqueSlug;
  }
  next();
});

// Create and export the Menu model
const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
