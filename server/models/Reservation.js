const mongoose = require('mongoose');

/**
 * @typedef {Object} Reservation
 * @property {string} bookingReference - Automatically generated unique booking reference (Format: CS-YYYYMMDD-XXX).
 * @property {string} customerName - Name of the customer making the reservation (3-100 characters).
 * @property {string} email - Email address of the customer (validated).
 * @property {string} phone - Indian mobile number (exactly 10 digits).
 * @property {Date} reservationDate - Date of the reservation (must be today or in the future).
 * @property {string} reservationTime - Time of the reservation in HH:MM format (24-hour).
 * @property {number} numberOfGuests - Number of guests (1-20).
 * @property {string} specialRequest - Any dietary or seating preferences (max 500 characters).
 * @property {string} notes - Internal administrative notes only. Not visible to customers.
 * @property {string} status - Booking status: Pending, Confirmed, Cancelled, Completed (default: Pending).
 * @property {number} [tableNumber] - Optional table number assigned to the reservation.
 * @property {boolean} isDeleted - Soft delete flag for reservations.
 * @property {Date} createdAt - Timestamp of document creation.
 * @property {Date} updatedAt - Timestamp of last modification.
 */

/**
 * Reservation Schema
 * Defines the structure, validations, and indexes for table reservations.
 */
const reservationSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: [true, 'Booking reference is required'],
      unique: true,
      trim: true
    },
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
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          // Validates exactly 10 digits starting with 6, 7, 8, or 9 (Indian mobile numbers format)
          return /^[6-9]\d{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit Indian mobile number`
      }
    },
    reservationDate: {
      type: Date,
      required: [true, 'Reservation date is required']
    },
    reservationTime: {
      type: String,
      required: [true, 'Reservation time is required'],
      validate: {
        validator: function (v) {
          // Validates 24-hour format HH:MM
          return /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} is not in a valid HH:MM format`
      }
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Number of guests must be at least 1'],
      max: [20, 'Number of guests cannot exceed 20']
    },
    specialRequest: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Pending'
    },
    tableNumber: {
      type: Number,
      min: [1, 'Table number must be greater than or equal to 1']
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'reservations'
  }
);

// Indexes to speed up queries and ensure uniqueness
reservationSchema.index({ bookingReference: 1 }, { unique: true });
reservationSchema.index({ reservationDate: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ email: 1 });

/**
 * Pre-validation middleware:
 * 1. Prevents reservation dates in the past.
 * 2. Automatically generates a unique, sequential bookingReference (CS-YYYYMMDD-XXX) for new bookings.
 */
reservationSchema.pre('validate', async function (next) {
  // 1. Validate reservationDate (must not be in the past)
  if (this.reservationDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to beginning of the day

    const inputDate = new Date(this.reservationDate);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      this.invalidate(
        'reservationDate',
        'Reservation date cannot be in the past',
        this.reservationDate
      );
    }
  }

  // 2. Generate bookingReference (format: CS-YYYYMMDD-XXX)
  if (this.isNew || !this.bookingReference) {
    // Generate date string components (YYYYMMDD) from the reservationDate (or current date as fallback)
    const refDate = this.reservationDate ? new Date(this.reservationDate) : new Date();
    const yyyy = refDate.getFullYear();
    const mm = String(refDate.getMonth() + 1).padStart(2, '0');
    const dd = String(refDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const prefix = `CS-${dateStr}-`;

    try {
      // Find the latest reservation created for the same date prefix to determine the next sequence number
      const latestReservation = await this.constructor.findOne(
        { bookingReference: new RegExp(`^${prefix}`) },
        { bookingReference: 1 },
        { sort: { bookingReference: -1 } }
      );

      let sequence = 1;
      if (latestReservation && latestReservation.bookingReference) {
        const parts = latestReservation.bookingReference.split('-');
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq)) {
          sequence = lastSeq + 1;
        }
      }

      // Pad sequence with leading zeros (e.g. 1 -> 001)
      const xxx = String(sequence).padStart(3, '0');
      this.bookingReference = `${prefix}${xxx}`;
    } catch (err) {
      return next(err);
    }
  }

  next();
});

// Create and export the Reservation model
const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
