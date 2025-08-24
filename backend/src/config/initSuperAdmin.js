const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

const initializeSuperAdmin = async () => {
  try {
    // Check if SuperAdmin already exists
    const existingAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingAdmin) {
      console.log('SuperAdmin account already exists');
      return;
    }

    // Create SuperAdmin account with default credentials
    const superAdmin = new User({
      name: 'Super Admin',
      email: process.env.SUPERADMIN_EMAIL || 'admin@gmail.com',
      password: process.env.SUPERADMIN_PASSWORD || 'Admin@123',
      role: 'superadmin',
      isApproved: true,
      contactNumber: process.env.ADMIN_CONTACT || '+911234567890',
      address: {
        street: 'Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '123456',
        country: 'India'
      }
    });

    await superAdmin.save();
    console.log('SuperAdmin account created successfully');

  } catch (error) {
    console.error('Error creating SuperAdmin account:', error);
    throw error;
  }
};

module.exports = initializeSuperAdmin;