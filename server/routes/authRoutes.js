const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  registerAdminValidator,
  loginValidator,
  changePasswordValidator
} = require('../validators/authValidator');

// POST /api/auth/login - Authenticate admin and return JWT
router.post('/login', loginValidator, authController.loginAdmin);

// GET /api/auth/profile - Retrieve details of the authenticated administrator
router.get('/profile', protect, authController.getProfile);

// PATCH /api/auth/change-password - Change account password (requires authentication)
router.patch('/change-password', protect, changePasswordValidator, authController.changePassword);

// POST /api/auth/logout - End admin session (requires authentication)
router.post('/logout', protect, authController.logoutAdmin);

// POST /api/auth/register - Create new administrators (Super Admin only)
router.post('/register', protect, authorize('Super Admin'), registerAdminValidator, authController.registerAdmin);

module.exports = router;
