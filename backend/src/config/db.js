const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/auracare';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 URI: ${mongoURI}`);
    
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    
    if (err.name === 'MongoNetworkError') {
      console.error('💡 Make sure MongoDB is running on your system');
      console.error('💡 For Windows: Start MongoDB service');
      console.error('💡 For Mac/Linux: Run "mongod" command');
    }
    
    if (err.name === 'MongoServerSelectionError') {
      console.error('💡 Check if MongoDB is accessible at the specified URI');
    }
    
    // Don't exit in development, just log the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;