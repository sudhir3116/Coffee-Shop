const contactService = require('../services/contactService');

/**
 * Controller handling request and response logic for Contact endpoints.
 */
class ContactController {
  /**
   * POST /api/contact
   * Creates and stores a new contact message, guarding against duplicate submissions.
   */
  async createContact(req, res) {
    try {
      const { name, email, subject, message } = req.body;
      const contact = await contactService.createContact({ name, email, subject, message });

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: contact
      });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message || 'Duplicate message detected.'
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while submitting contact message'
      });
    }
  }

  /**
   * GET /api/contact
   * Retrieves paginated, filtered, and searchable active contact messages.
   */
  async getAllContacts(req, res) {
    try {
      const { page, limit, search, status, priority } = req.query;
      const result = await contactService.getContactsPaginated({
        page,
        limit,
        search,
        status,
        priority
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
        message: error.message || 'Server error occurred while fetching contact messages'
      });
    }
  }

  /**
   * GET /api/contact/:id
   * Retrieves a single active contact message by ID.
   */
  async getContactById(req, res) {
    try {
      const contact = await contactService.getContactById(req.params.id);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Contact message retrieved successfully',
        data: contact
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while fetching the contact message'
      });
    }
  }

  /**
   * PATCH /api/contact/:id/status
   * Updates status of an existing contact message.
   */
  async updateContactStatus(req, res) {
    try {
      const { status } = req.body;
      const contact = await contactService.updateContactStatus(req.params.id, status);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Status successfully updated to ${status}`,
        data: contact
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while updating status'
      });
    }
  }

  /**
   * PATCH /api/contact/:id/reply
   * Records admin reply and automatically sets status to Replied.
   */
  async adminReplyContact(req, res) {
    try {
      const { adminReply } = req.body;
      const contact = await contactService.adminReplyContact(req.params.id, adminReply);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Reply successfully recorded',
        data: contact
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while recording reply'
      });
    }
  }

  /**
   * DELETE /api/contact/:id
   * Soft-deletes a contact message by setting isDeleted to true.
   */
  async deleteContact(req, res) {
    try {
      const contact = await contactService.softDeleteContact(req.params.id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Contact message deleted successfully',
        data: contact
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error occurred while deleting contact message'
      });
    }
  }
}

module.exports = new ContactController();
