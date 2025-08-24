require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const initializeSuperAdmin = require('./src/config/initSuperAdmin');
const User = require('./src/models/user.model');

async function testSetup() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');

    // Initialize SuperAdmin
    await initializeSuperAdmin();
    console.log('✅ SuperAdmin initialization completed');

    // Create collections if they don't exist
    await mongoose.connection.db.createCollection('users');
    await mongoose.connection.db.createCollection('salons');
    await mongoose.connection.db.createCollection('services');
    await mongoose.connection.db.createCollection('appointments');
    console.log('✅ Collections created successfully');

    // Verify SuperAdmin exists
    const superAdmin = await User.findOne({ role: 'superadmin' });
    if (superAdmin) {
      console.log('✅ SuperAdmin account verified:', {
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role
      });
    } else {
      console.error('❌ SuperAdmin account not found');
    }

    // Test database indexes
    const models = [
      { name: 'User', model: require('./src/models/user.model') },
      { name: 'Salon', model: require('./src/models/salon.model') },
      { name: 'Service', model: require('./src/models/service.model') },
      { name: 'Appointment', model: require('./src/models/appointment.model') }
    ];

    for (const { name, model } of models) {
      const indexes = await model.collection.indexes();
      console.log(`✅ ${name} indexes verified:`, indexes.map(idx => idx.name));
    }

    console.log('\n🎉 Setup test completed successfully!');
  } catch (error) {
    console.error('❌ Setup test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
    process.exit();
  }
}

testSetup();