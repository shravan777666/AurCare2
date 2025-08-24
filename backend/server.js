require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const createError = require('http-errors');

// Security packages
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { apiLimiter, authLimiter, uploadLimiter } = require('./src/middleware/rateLimiter');

// Initialize app
const app = express();

// Lightweight request logger (helps debug CORS/preflight)
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xss()); // Sanitize data against XSS attacks

// Database connection
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Explicitly handle preflight
app.options('*', cors());

// Increase timeout to 5 minutes (for file uploads)
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const salonRoutes = require('./src/routes/salon.routes');
const serviceRoutes = require('./src/routes/service.routes');
const appointmentRoutes = require('./src/routes/appointment.routes');
const adminRoutes = require('./src/routes/admin.routes');

// Initialize SuperAdmin
const initializeSuperAdmin = require('./src/config/initSuperAdmin');
initializeSuperAdmin().catch(console.error);

// Apply rate limiting (enabled in production by default)
if (process.env.RATE_LIMIT !== 'off' && process.env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter); // General API rate limiting
  app.use('/api/auth/login', authLimiter); // Stricter rate limiting for login
  app.use('/api/auth/register-salon-owner', uploadLimiter); // Rate limiting for file uploads
} else {
  console.log('Rate limiting disabled (development)');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', require('./src/routes/staff.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res, next) => {
  next(createError(404, 'Endpoint not found'));
});

// Enhanced Error handling middleware
app.use((err, req, res, next) => {
  // Set default values if not provided
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log detailed error for server-side debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    status,
    message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    ...(status >= 500 && { 
      body: req.body,
      headers: req.headers
    })
  });

  // Client response
  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      ...(err.details && { details: err.details })
    })
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});

// Timeout settings
server.keepAliveTimeout = 300000; // 5 minutes
server.headersTimeout = 310000; // 5.1 minutes

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', {
    message: err.message,
    stack: err.stack,
    ...(err.response && { response: err.response.data })
  });
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', {
    message: err.message,
    stack: err.stack
  });
  server.close(() => process.exit(1));
});