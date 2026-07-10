const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');
const {
  createReservationValidator,
  updateStatusValidator,
  assignTableValidator,
  idParamValidator
} = require('../validators/reservationValidator');

// POST /api/reservations - Create a new booking (public)
router.post('/', createReservationValidator, reservationController.createReservation);

// GET /api/reservations - Retrieve paginated/filtered list (admin only)
router.get('/', protect, reservationController.getAllReservations);

// GET /api/reservations/:id - Retrieve single reservation (admin only)
router.get('/:id', protect, idParamValidator, reservationController.getReservationById);

// PATCH /api/reservations/:id/status - Update reservation status (admin only)
router.patch('/:id/status', protect, updateStatusValidator, reservationController.updateReservationStatus);

// PATCH /api/reservations/:id/table - Assign table to reservation (admin only)
router.patch('/:id/table', protect, assignTableValidator, reservationController.assignTable);

// DELETE /api/reservations/:id - Soft-delete reservation (admin only)
router.delete('/:id', protect, idParamValidator, reservationController.deleteReservation);

module.exports = router;
