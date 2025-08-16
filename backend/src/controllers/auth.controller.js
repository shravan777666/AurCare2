const createError = require('http-errors');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.registerSalonOwner = async (req, res, next) => {
  try {
    // Validate required fields
    const { name, email, password, salonName, contactNumber, description, address } = req.body;
    if (!name || !email || !password || !salonName || !contactNumber) {
      throw createError(400, 'All required fields must be provided');
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw createError(400, 'Invalid email format');
    }

    // Validate phone number
    if (!/^\d{10}$/.test(contactNumber)) {
      throw createError(400, 'Phone number must be 10 digits');
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(409, 'Email already registered');
    }

    // Validate files were uploaded
    if (!req.files?.logo || !req.files?.license) {
      throw createError(400, 'Both logo and license files are required');
    }

    // Parse address if provided
    let parsedAddress = null;
    if (address) {
      try {
        parsedAddress = JSON.parse(address);
      } catch (e) {
        throw createError(400, 'Invalid address format');
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: 'salonowner',
      salonName,
      contactNumber,
      description,
      address: parsedAddress,
      logoUrl: `/uploads/logos/${req.files.logo[0].filename}`,
      licenseUrl: `/uploads/licenses/${req.files.license[0].filename}`,
      isApproved: false
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Salon registration submitted for approval',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      },
      token
    });

  } catch (error) {
    console.error('Registration Error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(createError(400, messages.join(', ')));
    }
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return next(createError(400, 'Invalid JSON data'));
    }

    // Pass other errors to error handler
    next(error);
  }
};

// Login controller: authenticate by email/password and issue JWT
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, 'Email and password are required');
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401, 'Invalid credentials');
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError(401, 'Invalid credentials');
    }

    // Optionally restrict unapproved salon owners
    if (user.role === 'salonowner' && user.isApproved === false) {
      // You can choose 403 or 200 with a flag; using 403 keeps it explicit
      throw createError(403, 'Account pending approval');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};