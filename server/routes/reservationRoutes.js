const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const {
  createReservationValidator,
  updateStatusValidator,
  assignTableValidator,
  idParamValidator
} = require('../validators/reservationValidator');

// POST /api/reservations - Create a new booking
router.post('/', createReservationValidator, reservationController.createReservation);

// GET /api/reservations - Retrieve paginated/filtered list of active reservations
router.get('/', reservationController.getAllReservations);

// GET /api/reservations/:id - Retrieve single reservation by ID
router.get('/:id', idParamValidator, reservationController.getReservationById);

// PATCH /api/reservations/:id/status - Update reservation status
router.patch('/:id/status', updateStatusValidator, reservationController.updateReservationStatus);

// PATCH /api/reservations/:id/table - Assign table to reservation
router.patch('/:id/table', assignTableValidator, reservationController.assignTable);

// DELETE /api/reservations/:id - Soft-delete reservation
router.delete('/:id', idParamValidator, reservationController.deleteReservation);

module.exports = router;
