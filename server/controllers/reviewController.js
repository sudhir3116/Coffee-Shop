const reviewService = require('../services/reviewService');

/**
 * Controller handling request and response logic for Review endpoints.
 */
class ReviewController {
  /**
   * POST /api/reviews
   * Submits a new review.
   */
  async createReview(req, res) {
    try {
      const review = await reviewService.createReview(req.body);

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review
      });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message || 'Duplicate review detected'
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while submitting review'
      });
    }
  }

  /**
   * GET /api/reviews
   * Retrieves paginated, sorted, filtered, and searchable reviews.
   */
  async getAllReviews(req, res) {
    try {
      const { page, limit, search, rating, isApproved, isFeatured, menuItem, sort, order } = req.query;
      const result = await reviewService.getReviewsPaginated({
        page,
        limit,
        search,
        rating,
        isApproved,
        isFeatured,
        menuItem,
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
        message: error.message || 'Server error occurred while retrieving reviews'
      });
    }
  }

  /**
   * GET /api/reviews/:id
   * Retrieves a single review by ID.
   */
  async getReviewById(req, res) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Review retrieved successfully',
        data: review
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while fetching review'
      });
    }
  }

  /**
   * PATCH /api/reviews/:id
   * Updates an existing review's fields.
   */
  async updateReview(req, res) {
    try {
      const review = await reviewService.updateReview(req.params.id, req.body);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review
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
        message: error.message || 'Server error occurred while updating review'
      });
    }
  }

  /**
   * PATCH /api/reviews/:id/approve
   * Approves a review, making it visible to the public.
   */
  async approveReview(req, res) {
    try {
      const review = await reviewService.approveReview(req.params.id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Review successfully approved',
        data: review
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while approving review'
      });
    }
  }

  /**
   * PATCH /api/reviews/:id/feature
   * Toggles the featured showcase status of a review.
   */
  async toggleFeatured(req, res) {
    try {
      const { isFeatured } = req.body;
      const review = await reviewService.toggleFeaturedReview(req.params.id, isFeatured);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Featured status successfully set to ${review.isFeatured}`,
        data: review
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while toggling featured status'
      });
    }
  }

  /**
   * PATCH /api/reviews/:id/reply
   * Logs an administrative response to a customer review.
   */
  async adminReply(req, res) {
    try {
      const { adminReply } = req.body;
      const review = await reviewService.adminReplyReview(req.params.id, adminReply);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Admin reply recorded successfully',
        data: review
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while submitting admin reply'
      });
    }
  }

  /**
   * PATCH /api/reviews/:id/like
   * Atomically increments the like count of a review.
   */
  async likeReview(req, res) {
    try {
      const review = await reviewService.likeReview(req.params.id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Review upvoted successfully',
        data: review
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while upvoting review'
      });
    }
  }

  /**
   * DELETE /api/reviews/:id
   * Soft deletes a review.
   */
  async deleteReview(req, res) {
    try {
      const review = await reviewService.softDeleteReview(req.params.id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
        data: review
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while deleting review'
      });
    }
  }
}

module.exports = new ReviewController();
