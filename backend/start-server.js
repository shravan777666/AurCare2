// Set default environment variables if not present
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://localhost:27017/auracare';
  console.log('⚠️  Using default MongoDB URI. Set MONGO_URI in .env for production.');
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
  console.log('⚠️  Using default JWT secret. Set JWT_SECRET in .env for production.');
}

if (!process.env.PORT) {
  process.env.PORT = 5000;
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Start the server
require('./server.js');

