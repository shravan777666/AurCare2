const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../models/User.model');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'No authentication token, authorization denied');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by id
      const user = await User.findById(decoded.id)
        .select('-password') // Exclude password from the result
        .lean(); // Convert to plain JavaScript object

      if (!user) {
        throw createError(401, 'User not found');
      }

      // Check if user is approved (for salon owners)
      if (user.role === 'salonowner' && !user.isApproved) {
        throw createError(403, 'Account pending approval');
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw createError(401, 'Invalid token');
      }
      if (err.name === 'TokenExpiredError') {
        throw createError(401, 'Token expired');
      }
      throw err;
    }

  } catch (error) {
    next(error);
  }
};

// Middleware to check if user has required role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'Access denied'));
    }

    next();
  };
};

module.exports = {
  auth,
  checkRole
};