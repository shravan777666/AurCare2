const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  const connect = async () => {
    try {
      const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/auracare';

      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      });

      console.log('✅ MongoDB Connected Successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🔗 URI: ${mongoURI}`);

    } catch (error) {
      console.error('❌ MongoDB Connection Error:', error.message);
      
      if (error.name === 'MongoNetworkError') {
        console.error('💡 Make sure MongoDB is running on your system');
        console.error('💡 For Windows: Start MongoDB service');
        console.error('💡 For Mac/Linux: Run "mongod" command');
      }
      
      if (error.name === 'MongoServerSelectionError') {
        console.error('💡 Check if MongoDB is accessible at the specified URI');
      }

      if (retries < maxRetries) {
        retries++;
        console.log(`⏳ Retrying connection... Attempt ${retries} of ${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return connect();
      } else {
        if (process.env.NODE_ENV === 'production') {
          console.error('❌ Failed to connect to MongoDB after multiple attempts');
          process.exit(1);
        } else {
          console.warn('⚠️ Failed to connect to MongoDB, but continuing in development mode');
        }
      }
    }
  };

  await connect();

  // Set up connection event handlers
  mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
    if (process.env.NODE_ENV === 'production') {
      connectDB(); // Attempt to reconnect
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('🚨 MongoDB error:', err);
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
};

module.exports = connectDB;