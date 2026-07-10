const Contact = require('../models/Contact');

/**
 * Service handling all database operations for the Contact model.
 */
class ContactService {
  /**
   * Helper function to find a contact message by ID (avoiding duplicate database query patterns).
   * @param {string} id - The MongoDB ID.
   * @returns {Promise<Document|null>}
   */
  async findContactById(id) {
    return await Contact.findOne({ _id: id, isDeleted: false });
  }

  /**
   * Check if a duplicate submission exists from the same email with the same subject and message within the last 10 minutes.
   * @param {string} email - Sender's email.
   * @param {string} subject - Message subject.
   * @param {string} message - Message body.
   * @returns {Promise<boolean>} True if duplicate is detected, false otherwise.
   */
  async checkDuplicateSubmission(email, subject, message) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const duplicate = await Contact.findOne({
      email: email.toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: { $gte: tenMinutesAgo },
      isDeleted: false
    });
    return !!duplicate;
  }

  /**
   * Save a new contact message to the database if it is not a duplicate.
   * @param {Object} contactData - The payload containing name, email, subject, message.
   * @throws {Error} If duplicate is detected.
   * @returns {Promise<Document>} The saved Contact document.
   */
  async createContact(contactData) {
    const { name, email, subject, message } = contactData;

    // Check duplicate
    const isDuplicate = await this.checkDuplicateSubmission(email, subject, message);
    if (isDuplicate) {
      const error = new Error('Duplicate message detected.');
      error.statusCode = 409;
      throw error;
    }

    const contact = new Contact({ name, email, subject, message });
    return await contact.save();
  }

  /**
   * Fetch paginated contact messages with support for search and filters.
   * @param {Object} queryOptions - Pagination, search, and filtering options.
   * @returns {Promise<Object>} Object containing paginated data and metadata.
   */
  async getContactsPaginated({ page = 1, limit = 10, search, status, priority }) {
    const filterQuery = { isDeleted: false };

    // Apply Search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filterQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex }
      ];
    }

    // Apply Filters
    if (status) {
      filterQuery.status = status;
    }
    if (priority) {
      filterQuery.priority = priority;
    }

    // Convert query parameters to numbers
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch documents and count concurrently
    const [data, totalDocuments] = await Promise.all([
      Contact.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum),
      Contact.countDocuments(filterQuery)
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
   * Fetch a single active contact message by ID.
   * @param {string} id - The MongoDB ID of the contact message.
   * @returns {Promise<Document|null>} The Contact document or null if not found.
   */
  async getContactById(id) {
    return await this.findContactById(id);
  }

  /**
   * Update the status of an existing contact message.
   * @param {string} id - The contact message ID.
   * @param {string} status - The status to set.
   * @returns {Promise<Document|null>} The updated Contact document or null.
   */
  async updateContactStatus(id, status) {
    // Verify existence first using helper
    const contact = await this.findContactById(id);
    if (!contact) return null;

    contact.status = status;
    return await contact.save();
  }

  /**
   * Record admin reply and set status to Replied.
   * @param {string} id - The contact message ID.
   * @param {string} adminReply - The reply message.
   * @returns {Promise<Document|null>} The updated Contact document or null.
   */
  async adminReplyContact(id, adminReply) {
    // Verify existence first using helper
    const contact = await this.findContactById(id);
    if (!contact) return null;

    contact.adminReply = adminReply;
    contact.repliedAt = new Date();
    contact.status = 'Replied';
    return await contact.save();
  }

  /**
   * Soft-delete a contact message by setting isDeleted to true.
   * @param {string} id - The contact message ID.
   * @returns {Promise<Document|null>} The soft-deleted Contact document or null.
   */
  async softDeleteContact(id) {
    // Verify existence first using helper
    const contact = await this.findContactById(id);
    if (!contact) return null;

    contact.isDeleted = true;
    return await contact.save();
  }
}

module.exports = new ContactService();
