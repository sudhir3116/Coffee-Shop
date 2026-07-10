const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const {
  createReviewValidator,
  updateReviewValidator,
  updateFeaturedValidator,
  adminReplyValidator,
  idParamValidator
} = require('../validators/reviewValidator');

// POST /api/reviews - Submit a new customer review
router.post('/', createReviewValidator, reviewController.createReview);

// GET /api/reviews - Get paginated, filtered reviews
router.get('/', reviewController.getAllReviews);

// GET /api/reviews/:id - Get a single review
router.get('/:id', idParamValidator, reviewController.getReviewById);

// PATCH /api/reviews/:id - Edit an existing review
router.patch('/:id', updateReviewValidator, reviewController.updateReview);

// PATCH /api/reviews/:id/approve - Approve review for public viewing
router.patch('/:id/approve', idParamValidator, reviewController.approveReview);

// PATCH /api/reviews/:id/feature - Toggle featured status of a review
router.patch('/:id/feature', updateFeaturedValidator, reviewController.toggleFeatured);

// PATCH /api/reviews/:id/reply - Add an administrative reply to a review
router.patch('/:id/reply', adminReplyValidator, reviewController.adminReply);

// PATCH /api/reviews/:id/like - Atomically upvote/like a review
router.patch('/:id/like', idParamValidator, reviewController.likeReview);

// DELETE /api/reviews/:id - Soft delete a review
router.delete('/:id', idParamValidator, reviewController.deleteReview);

module.exports = router;
