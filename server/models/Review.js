const mongoose = require('mongoose');

/**
 * @typedef {Object} Review
 * @property {string} customerName - Name of the customer who wrote the review (3-100 characters).
 * @property {string} email - Email address of the customer (validated).
 * @property {mongoose.Schema.Types.ObjectId} [menuItem] - Reference to the Menu item being reviewed. Optional (can be a general shop review).
 * @property {number} rating - Score given by the reviewer (1 - 5).
 * @property {string} title - Title header of the review (5-100 characters).
 * @property {string} comment - Full content review commentary (10-1000 characters).
 * @property {boolean} isApproved - Admin approval status to prevent spam from appearing on the front-end (default: false).
 * @property {boolean} isFeatured - Flag indicating if this review should be featured on the homepage/promo panels (default: false).
 * @property {number} likes - Counter tracking user upvotes/likes on the review (default: 0).
 * @property {string} adminReply - Optional response from coffee shop manager/admin (default: "").
 * @property {Date} [repliedAt] - Date when the administrator replied.
 * @property {boolean} isDeleted - Soft delete flag.
 * @property {string} shortComment - Virtual property returning the first 100 characters of the comment.
 * @property {Date} createdAt - Document creation date.
 * @property {Date} updatedAt - Last modified date.
 */

/**
 * Review Schema
 * Defines the structure, validations, and indexes for customer reviews on items or shop services.
 */
const reviewSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [3, 'Customer name must be at least 3 characters long'],
      maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Regular expression for standard email validation
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address`
      }
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu'
    },
    rating: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars']
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      minlength: [5, 'Review title must be at least 5 characters long'],
      maxlength: [100, 'Review title cannot exceed 100 characters']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Review comment must be at least 10 characters long'],
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, 'Likes count cannot be negative']
    },
    adminReply: {
      type: String,
      trim: true,
      default: ''
    },
    repliedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'reviews',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes to speed up lookups and analytics queries
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ menuItem: 1 });

/**
 * Virtual property to extract a short preview snippet of the review comment.
 * Appends '...' if the original comment is longer than 100 characters.
 */
reviewSchema.virtual('shortComment').get(function () {
  if (!this.comment) return '';
  return this.comment.length > 100
    ? `${this.comment.substring(0, 100)}...`
    : this.comment;
});

// Create and export the Review model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
