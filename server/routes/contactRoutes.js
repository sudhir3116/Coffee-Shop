const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const {
  createContactValidator,
  updateStatusValidator,
  adminReplyValidator,
  idParamValidator
} = require('../validators/contactValidator');

// POST /api/contact - Submit new contact inquiry (public)
router.post('/', createContactValidator, contactController.createContact);

// GET /api/contact - Retrieve all contact messages (admin only)
router.get('/', protect, contactController.getAllContacts);

// GET /api/contact/:id - Retrieve single contact message (admin only)
router.get('/:id', protect, idParamValidator, contactController.getContactById);

// PATCH /api/contact/:id/status - Update contact status (admin only)
router.patch('/:id/status', protect, updateStatusValidator, contactController.updateContactStatus);

// PATCH /api/contact/:id/reply - Add administrator reply (admin only)
router.patch('/:id/reply', protect, adminReplyValidator, contactController.adminReplyContact);

// DELETE /api/contact/:id - Soft delete contact message (admin only)
router.delete('/:id', protect, idParamValidator, contactController.deleteContact);

module.exports = router;
