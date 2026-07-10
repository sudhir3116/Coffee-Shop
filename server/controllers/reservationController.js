const reservationService = require('../services/reservationService');

/**
 * Controller handling request and response logic for Reservation endpoints.
 */
class ReservationController {
  /**
   * POST /api/reservations
   * Creates a new reservation, checking for potential duplicates.
   */
  async createReservation(req, res) {
    try {
      const reservation = await reservationService.createReservation(req.body);

      return res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: reservation
      });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message || 'Conflict occurred during reservation creation'
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while creating reservation'
      });
    }
  }

  /**
   * GET /api/reservations
   * Fetches paginated, searchable, and filtered reservations.
   */
  async getAllReservations(req, res) {
    try {
      const { page, limit, search, status, reservationDate } = req.query;
      const result = await reservationService.getReservationsPaginated({
        page,
        limit,
        search,
        status,
        reservationDate
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
        message: error.message || 'Server error occurred while fetching reservations'
      });
    }
  }

  /**
   * GET /api/reservations/:id
   * Fetches a single reservation by ID.
   */
  async getReservationById(req, res) {
    try {
      const reservation = await reservationService.getReservationById(req.params.id);
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Reservation retrieved successfully',
        data: reservation
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while fetching reservation'
      });
    }
  }

  /**
   * PATCH /api/reservations/:id/status
   * Updates status of an existing reservation.
   */
  async updateReservationStatus(req, res) {
    try {
      const { status } = req.body;
      const reservation = await reservationService.updateReservationStatus(req.params.id, status);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Reservation status successfully updated to ${status}`,
        data: reservation
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
        message: error.message || 'Server error occurred while updating status'
      });
    }
  }

  /**
   * PATCH /api/reservations/:id/table
   * Assigns a table number to the reservation.
   */
  async assignTable(req, res) {
    try {
      const { tableNumber } = req.body;
      const reservation = await reservationService.assignTable(req.params.id, tableNumber);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Table number ${tableNumber} successfully assigned`,
        data: reservation
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
        message: error.message || 'Server error occurred while assigning table'
      });
    }
  }

  /**
   * DELETE /api/reservations/:id
   * Soft deletes a reservation.
   */
  async deleteReservation(req, res) {
    try {
      const reservation = await reservationService.softDeleteReservation(req.params.id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Reservation deleted successfully',
        data: reservation
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while deleting reservation'
      });
    }
  }
}

module.exports = new ReservationController();
