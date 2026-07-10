const Reservation = require('../models/Reservation');

/**
 * Service managing database operations and business logic for Reservations.
 */
class ReservationService {
  /**
   * Helper to retrieve a single reservation by ID.
   * @param {string} id - Reservation MongoDB ID.
   * @returns {Promise<Document|null>}
   */
  async findReservationById(id) {
    return await Reservation.findOne({ _id: id, isDeleted: false });
  }

  /**
   * Checks for duplicate reservations on the same date and time for a specific email.
   */
  async checkDuplicateReservation(email, reservationDate, reservationTime) {
    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    return await Reservation.findOne({
      email: email.toLowerCase(),
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
      reservationTime,
      isDeleted: false
    });
  }

  /**
   * Checks if a table conflict exists for Confirmed bookings on the same date and time.
   */
  async checkTableConflict(tableNumber, reservationDate, reservationTime, excludeId = null) {
    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      tableNumber,
      status: 'Confirmed',
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
      reservationTime,
      isDeleted: false
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return await Reservation.findOne(query);
  }

  /**
   * Create a new table reservation after verifying duplication rules.
   */
  async createReservation(reservationData) {
    const { customerName, email, phone, reservationDate, reservationTime, numberOfGuests, specialRequest } = reservationData;

    // Rule: Prevent duplicates (Same email, date, and time)
    const duplicate = await this.checkDuplicateReservation(email, reservationDate, reservationTime);
    if (duplicate) {
      const err = new Error('A reservation with this email, date, and time already exists.');
      err.statusCode = 409;
      throw err;
    }

    const reservation = new Reservation({
      customerName,
      email,
      phone,
      reservationDate,
      reservationTime,
      numberOfGuests,
      specialRequest
    });

    return await reservation.save();
  }

  /**
   * Get all active reservations with pagination, search, and filtering options.
   */
  async getReservationsPaginated({ page = 1, limit = 10, search, status, reservationDate }) {
    const filterQuery = { isDeleted: false };

    // Search query parsing
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filterQuery.$or = [
        { customerName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { bookingReference: searchRegex }
      ];
    }

    // Filters parsing
    if (status) {
      filterQuery.status = status;
    }

    if (reservationDate) {
      const startOfDay = new Date(reservationDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(reservationDate);
      endOfDay.setHours(23, 59, 59, 999);

      filterQuery.reservationDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    const [data, totalDocuments] = await Promise.all([
      Reservation.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum),
      Reservation.countDocuments(filterQuery)
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
   * Fetch a single active reservation.
   */
  async getReservationById(id) {
    return await this.findReservationById(id);
  }

  /**
   * Update the status of an existing reservation.
   */
  async updateReservationStatus(id, status) {
    const reservation = await this.findReservationById(id);
    if (!reservation) return null;

    // Rule: If status is updated to Confirmed and a table number is assigned, check for conflict
    if (status === 'Confirmed' && reservation.tableNumber) {
      const conflict = await this.checkTableConflict(
        reservation.tableNumber,
        reservation.reservationDate,
        reservation.reservationTime,
        id
      );
      if (conflict) {
        const err = new Error(`Table ${reservation.tableNumber} is already booked for this date and time.`);
        err.statusCode = 409;
        throw err;
      }
    }

    reservation.status = status;
    return await reservation.save();
  }

  /**
   * Assign a table to a reservation after checking for conflicts.
   */
  async assignTable(id, tableNumber) {
    const reservation = await this.findReservationById(id);
    if (!reservation) return null;

    // Rule: Prevent table conflicts for Confirmed bookings
    if (reservation.status === 'Confirmed') {
      const conflict = await this.checkTableConflict(
        tableNumber,
        reservation.reservationDate,
        reservation.reservationTime,
        id
      );
      if (conflict) {
        const err = new Error(`Table ${tableNumber} is already booked for this date and time.`);
        err.statusCode = 409;
        throw err;
      }
    }

    reservation.tableNumber = tableNumber;
    return await reservation.save();
  }

  /**
   * Soft delete a reservation by setting isDeleted to true.
   */
  async softDeleteReservation(id) {
    const reservation = await this.findReservationById(id);
    if (!reservation) return null;

    reservation.isDeleted = true;
    return await reservation.save();
  }
}

module.exports = new ReservationService();
