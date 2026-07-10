const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Middleware to protect routes: Verifies JWT, loads active, non-deleted administrator onto req.admin.
 */
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find active, non-deleted admin matching ID from token payload
      const admin = await Admin.findOne({ _id: decoded.id, isDeleted: false });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: administrator account not found.'
        });
      }

      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized: administrator account is deactivated.'
        });
      }

      // Check if password was changed after token was issued
      if (admin.passwordChangedAt) {
        const changedSeconds = parseInt(admin.passwordChangedAt.getTime() / 1000, 10);
        if (decoded.iat < changedSeconds) {
          return res.status(401).json({
            success: false,
            message: 'Session expired: Password changed recently. Please log in again.'
          });
        }
      }

      // Attach admin to request object
      req.admin = admin;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: token verification failed.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Bearer token is missing.'
    });
  }
};

/**
 * Middleware to restrict access based on Administrator Roles.
 * @param {...string} roles - List of allowed roles (e.g. 'Super Admin', 'Admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.admin ? req.admin.role : 'Guest'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
