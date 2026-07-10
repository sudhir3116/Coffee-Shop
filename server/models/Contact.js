const mongoose = require('mongoose');

/**
 * @typedef {Object} Contact
 * @property {string} name - Name of the sender (3-100 characters).
 * @property {string} email - Email address of the sender (validated).
 * @property {string} subject - Subject line of the contact message (5-150 characters).
 * @property {string} message - Body of the message (10-1000 characters).
 * @property {string} status - Message status: New, Read, Replied, Archived (default: New).
 * @property {string} priority - Message priority: Low, Medium, High (default: Medium).
 * @property {string} adminReply - Reply message sent by the admin (defaults to empty string).
 * @property {Date} [repliedAt] - Date when the admin replied.
 * @property {boolean} isDeleted - Soft delete flag for contact messages.
 * @property {boolean} isReplied - Virtual property that returns true if adminReply is present.
 * @property {Date} createdAt - Timestamp of message creation.
 * @property {Date} updatedAt - Timestamp of last modification.
 */

/**
 * Contact Schema
 * Defines the structure, validations, and indexes for customer contact messages and inquiries.
 */
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
      minlength: [3, 'Sender name must be at least 3 characters long'],
      maxlength: [100, 'Sender name cannot exceed 100 characters']
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
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [5, 'Subject must be at least 5 characters long'],
      maxlength: [150, 'Subject cannot exceed 150 characters']
    },
    message: {
      type: String,
      required: [true, 'Message body is required'],
      trim: true,
      minlength: [10, 'Message body must be at least 10 characters long'],
      maxlength: [1000, 'Message body cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Read', 'Replied', 'Archived'],
        message: '{VALUE} is not a valid message status'
      },
      default: 'New'
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority level'
      },
      default: 'Medium'
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
    collection: 'contacts',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes to speed up queries by email, status, and priority
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });

/**
 * Virtual property indicating if the contact inquiry has received a response.
 * Returns true if adminReply is defined and has non-whitespace characters.
 */
contactSchema.virtual('isReplied').get(function () {
  return !!(this.adminReply && this.adminReply.trim().length > 0);
});

// Create and export the Contact model
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
