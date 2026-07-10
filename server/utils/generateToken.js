const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token signed with process.env.JWT_SECRET.
 * @param {string} id - The MongoDB ID of the Admin document.
 * @returns {string} The signed JWT string.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = generateToken;
