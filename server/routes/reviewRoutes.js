const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const {
  createReviewValidator,
  updateReviewValidator,
  updateFeaturedValidator,
  adminReplyValidator,
  idParamValidator
} = require('../validators/reviewValidator');

// POST /api/reviews - Submit a new customer review (public)
router.post('/', createReviewValidator, reviewController.createReview);

// GET /api/reviews - Get paginated, filtered reviews (public)
router.get('/', reviewController.getAllReviews);

// GET /api/reviews/:id - Get a single review (public)
router.get('/:id', idParamValidator, reviewController.getReviewById);

// PATCH /api/reviews/:id - Edit an existing review (admin only)
router.patch('/:id', protect, updateReviewValidator, reviewController.updateReview);

// PATCH /api/reviews/:id/approve - Approve review for public viewing (admin only)
router.patch('/:id/approve', protect, idParamValidator, reviewController.approveReview);

// PATCH /api/reviews/:id/feature - Toggle featured status (admin only)
router.patch('/:id/feature', protect, updateFeaturedValidator, reviewController.toggleFeatured);

// PATCH /api/reviews/:id/reply - Add an administrative reply (admin only)
router.patch('/:id/reply', protect, adminReplyValidator, reviewController.adminReply);

// PATCH /api/reviews/:id/like - Atomically upvote/like a review (public)
router.patch('/:id/like', idParamValidator, reviewController.likeReview);

// DELETE /api/reviews/:id - Soft delete a review (admin only)
router.delete('/:id', protect, idParamValidator, reviewController.deleteReview);

module.exports = router;
