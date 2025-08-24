const createError = require('http-errors');

const validateRegistration = (req, res, next) => {
  try {
    let { name, email, password, role, salonName, contactNumber, address } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      throw createError(400, 'Name, email, and password are required');
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      throw createError(400, 'Invalid email format');
    }

    // Password validation
    if (password.length < 8) {
      throw createError(400, 'Password must be at least 8 characters long');
    }

    // Normalize: if multipart/form-data, address may arrive as JSON string
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
        req.body.address = address; // keep normalized for downstream
      } catch (e) {
        throw createError(400, 'Invalid address format');
      }
    }

    // Treat salon-owner registration route as salonowner role
    const isSalonOwner = role === 'salonowner' || (req.originalUrl && req.originalUrl.includes('register-salon-owner'));

    if (isSalonOwner) {
      if (!salonName) {
        throw createError(400, 'Salon name is required for salon owners');
      }

      // Align with controller: exactly 10 digits
      if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
        throw createError(400, 'Contact number must be exactly 10 digits');
      }

      if (!address || typeof address !== 'object') {
        throw createError(400, 'Valid address object is required for salon owners');
      }

      const { street, city, state, zipCode, postalCode } = address;
      const finalZip = zipCode || postalCode;
      if (!street || !city || !finalZip) {
        throw createError(400, 'Complete address details are required for salon owners');
      }

      // Normalize zip/postal code key
      req.body.address = { ...address, zipCode: finalZip };
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, 'Email and password are required');
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      throw createError(400, 'Invalid email format');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateRegistration,
  validateLogin
};