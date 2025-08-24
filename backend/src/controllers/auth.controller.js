const createError = require('http-errors');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

exports.registerSalonOwner = async (req, res, next) => {
  try {
    // Validate required fields
    const { name, email, password, salonName, contactNumber, description } = req.body;
    let { address } = req.body;

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

    // Normalize/parse address if provided (can be object or JSON string)
    let parsedAddress = null;
    if (address) {
      try {
        parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (e) {
        throw createError(400, 'Invalid address format');
      }

      // Normalize postal/zip key
      if (parsedAddress) {
        const { zipCode, postalCode } = parsedAddress;
        parsedAddress.zipCode = zipCode || postalCode || undefined;
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

// Register customer
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw createError(400, 'All required fields must be provided');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(409, 'Email already registered');
    }

    const user = new User({
      name,
      email,
      password,
      role: 'customer'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // JWT tokens are stateless, so we just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw createError(404, 'User not found');
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, contactNumber, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      throw createError(404, 'User not found');
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw createError(409, 'Email already in use');
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.contactNumber = contactNumber || user.contactNumber;
    user.address = address || user.address;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
        address: user.address
      }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw createError(400, 'Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'User not found');
    }

    // TODO: Implement password reset token generation and email sending
    res.json({
      success: true,
      message: 'Password reset instructions sent to email'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw createError(400, 'Token and new password are required');
    }

    // TODO: Implement password reset logic
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw createError(400, 'Verification token is required');
    }

    // TODO: Implement email verification logic
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw createError(400, 'Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'User not found');
    }

    // TODO: Implement verification email resend logic
    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
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

    const user = await User.findOne({ email });
    if (!user) throw createError(401, 'Invalid credentials');

    let isMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }
    if (!isMatch) throw createError(401, 'Invalid credentials');

    if (user.role === 'salonowner' && user.isApproved === false) {
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

// Google OAuth: verify ID token from client (Google Sign-In) and upsert user
exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) throw createError(400, 'Google ID token is required');
    const allowedRoles = ['customer', 'staff', 'salonowner'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    // Verify token with Google tokeninfo endpoint
    const googleRes = await axios.get('https://oauth2.googleapis.com/tokeninfo', { params: { id_token: idToken } });
    const payload = googleRes.data; // contains email, name, sub, email_verified, picture, etc.

    if (!payload || payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw createError(401, 'Invalid Google token');
    }
    if (payload.email_verified !== 'true' && payload.email_verified !== true) {
      throw createError(401, 'Email not verified by Google');
    }

    const email = payload.email; 
    const name = payload.name || email.split('@')[0];

    let user = await User.findOne({ email });

    if (!user) {
      // New user via Google
      user = new User({
        name,
        email,
        password: 'google-oauth', // placeholder; not used for Google users
        role: userRole,
        isApproved: userRole === 'salonowner' ? false : true
      });
      await user.save();
    } else {
      // Update role only if none of the roles differ and role provided is more specific
      if (user.role !== userRole) {
        user.role = user.role === 'superadmin' ? user.role : userRole;
        await user.save();
      }
    }

    // Block login for unapproved salon owners
    if (user.role === 'salonowner' && user.isApproved === false) {
      throw createError(403, 'Account pending approval');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
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
    // Normalize Google errors
    if (error.response?.data) {
      return next(createError(401, 'Invalid Google token'));
    }
    next(error);
  }
};