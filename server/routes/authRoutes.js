const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerAdminValidator,
  loginValidator,
  changePasswordValidator
} = require('../validators/authValidator');

// POST /api/auth/register - Create first or additional administrators
router.post('/register', registerAdminValidator, authController.registerAdmin);

// POST /api/auth/login - authenticate user and return JWT
router.post('/login', loginValidator, authController.loginAdmin);

// GET /api/auth/profile - Retrieve details of currently logged-in administrator
router.get('/profile', protect, authController.getProfile);

// PATCH /api/auth/change-password - Change account password
router.patch('/change-password', protect, changePasswordValidator, authController.changePassword);

// POST /api/auth/logout - End admin session
router.post('/logout', authController.logoutAdmin);

module.exports = router;
