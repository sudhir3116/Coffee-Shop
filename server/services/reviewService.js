const Review = require('../models/Review');

/**
 * Service managing database operations and business logic for the Review model.
 */
class ReviewService {
  /**
   * Helper to retrieve a single active (non-deleted) review.
   */
  async findReviewById(id) {
    return await Review.findOne({ _id: id, isDeleted: false });
  }

  /**
   * Check if a duplicate review exists (Same email, same title, and same menuItem).
   */
  async checkDuplicateReview(email, title, menuItem = null) {
    const query = {
      email: email.toLowerCase(),
      title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
      menuItem: menuItem || null,
      isDeleted: false
    };
    return await Review.findOne(query);
  }

  /**
   * Creates a new review after checking for duplication.
   */
  async createReview(reviewData) {
    const { customerName, email, rating, title, comment, menuItem } = reviewData;

    // Rule: Prevent duplicates
    const duplicate = await this.checkDuplicateReview(email, title, menuItem);
    if (duplicate) {
      const err = new Error('You have already submitted a review with this title for this item.');
      err.statusCode = 409;
      throw err;
    }

    const review = new Review({
      customerName,
      email,
      rating,
      title,
      comment,
      menuItem: menuItem || undefined
    });

    return await review.save();
  }

  /**
   * Fetches paginated reviews supporting search, filters, and sorting.
   */
  async getReviewsPaginated({
    page = 1,
    limit = 10,
    search,
    rating,
    isApproved,
    isFeatured,
    menuItem,
    sort = 'createdAt',
    order = 'desc'
  }) {
    const filterQuery = { isDeleted: false };

    // Search query parsing (customerName, title, comment)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filterQuery.$or = [
        { customerName: searchRegex },
        { title: searchRegex },
        { comment: searchRegex }
      ];
    }

    // Filter by rating
    if (rating !== undefined) {
      filterQuery.rating = parseInt(rating, 10);
    }

    // Filter by approval status
    if (isApproved !== undefined) {
      filterQuery.isApproved = isApproved === 'true' || isApproved === true;
    }

    // Filter by featured status
    if (isFeatured !== undefined) {
      filterQuery.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    // Filter by menuItem ID
    if (menuItem) {
      filterQuery.menuItem = menuItem;
    }

    // Sort setup
    const sortField = ['createdAt', 'rating', 'likes'].includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortQuery = { [sortField]: sortOrder };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    const [data, totalDocuments] = await Promise.all([
      Review.find(filterQuery)
        .sort(sortQuery)
        .skip(skipNum)
        .limit(limitNum)
        .populate('menuItem', 'name category price image'),
      Review.countDocuments(filterQuery)
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
   * Fetch a single active review.
   */
  async getReviewById(id) {
    return await Review.findOne({ _id: id, isDeleted: false }).populate('menuItem', 'name category price image');
  }

  /**
   * Updates an existing review.
   */
  async updateReview(id, updateData) {
    const review = await this.findReviewById(id);
    if (!review) return null;

    // Prevent name/email changes from generating duplicate reviews
    if (updateData.title && updateData.title.trim().toLowerCase() !== review.title.toLowerCase()) {
      const duplicate = await this.checkDuplicateReview(
        updateData.email || review.email,
        updateData.title,
        updateData.menuItem || review.menuItem
      );
      if (duplicate) {
        const err = new Error('A review with this title already exists.');
        err.statusCode = 409;
        throw err;
      }
    }

    // Apply updates
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        review[key] = updateData[key];
      }
    });

    return await review.save();
  }

  /**
   * Approves a review.
   */
  async approveReview(id) {
    const review = await this.findReviewById(id);
    if (!review) return null;

    review.isApproved = true;
    return await review.save();
  }

  /**
   * Toggles or sets featured status on a review.
   */
  async toggleFeaturedReview(id, isFeatured) {
    const review = await this.findReviewById(id);
    if (!review) return null;

    review.isFeatured = isFeatured !== undefined ? isFeatured : !review.isFeatured;
    return await review.save();
  }

  /**
   * Records an admin reply to a review.
   */
  async adminReplyReview(id, adminReply) {
    const review = await this.findReviewById(id);
    if (!review) return null;

    review.adminReply = adminReply;
    review.repliedAt = new Date();
    return await review.save();
  }

  /**
   * Atomically increments the likes count of a review.
   */
  async likeReview(id) {
    return await Review.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { likes: 1 } },
      { new: true }
    );
  }

  /**
   * Soft deletes a review.
   */
  async softDeleteReview(id) {
    const review = await this.findReviewById(id);
    if (!review) return null;

    review.isDeleted = true;
    return await review.save();
  }
}

module.exports = new ReviewService();
