const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const {
  createContactValidator,
  updateStatusValidator,
  adminReplyValidator,
  idParamValidator
} = require('../validators/contactValidator');

// POST /api/contact - Submit new contact inquiry
router.post('/', createContactValidator, contactController.createContact);

// GET /api/contact - Retrieve all contact messages, sorted newest first
router.get('/', contactController.getAllContacts);

// GET /api/contact/:id - Retrieve single contact message by ID
router.get('/:id', idParamValidator, contactController.getContactById);

// PATCH /api/contact/:id/status - Update contact status
router.patch('/:id/status', updateStatusValidator, contactController.updateContactStatus);

// PATCH /api/contact/:id/reply - Add administrator reply and mark as Replied
router.patch('/:id/reply', adminReplyValidator, contactController.adminReplyContact);

// DELETE /api/contact/:id - Soft delete contact message
router.delete('/:id', idParamValidator, contactController.deleteContact);

module.exports = router;
