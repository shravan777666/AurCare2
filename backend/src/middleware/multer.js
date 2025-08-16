const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createError = require('http-errors');

// Configure upload settings
const uploadSettings = {
  logo: {
    dir: 'public/uploads/logos',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: /jpeg|jpg|png/,
    mimetypes: ['image/jpeg', 'image/jpg', 'image/png']
  },
  license: {
    dir: 'public/uploads/licenses',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: /pdf/,
    mimetypes: ['application/pdf']
  }
};

// Create directories if they don't exist
Object.values(uploadSettings).forEach(({ dir }) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Enhanced file validation
const fileFilter = (req, file, cb) => {
  try {
    const config = file.fieldname === 'logo' ? uploadSettings.logo : uploadSettings.license;
    
    const extname = path.extname(file.originalname).toLowerCase();
    const isValidExt = config.allowedTypes.test(extname);
    const isValidMime = config.mimetypes.includes(file.mimetype);

    if (isValidExt && isValidMime) {
      return cb(null, true);
    }

    cb(createError(400, 
      `Invalid file type for ${file.fieldname}. ` +
      `Allowed: ${config.mimetypes.join(', ')}`));
  } catch (err) {
    console.error('File validation error:', err);
    cb(createError(500, 'File validation failed'));
  }
};

// Storage configuration with improved error handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const config = uploadSettings[file.fieldname] || {};
    cb(null, config.dir || 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'logo' ? 'logo' : 'license';
    cb(null, `${prefix}-${Date.now()}${ext}`);
  }
});

// Main upload middleware with comprehensive error handling
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadSettings.license.maxSize, // Use the larger 5MB limit
    files: 2 // Exactly 2 files (logo + license)
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'license', maxCount: 1 }
]);

// Enhanced error handling wrapper
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(createError(413, `File too large. Maximum size is ${uploadSettings.license.maxSize/1024/1024}MB`));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(createError(400, 'Exactly two files (logo and license) are required'));
        }
      }
      return next(err);
    }
    
    // Verify both files were uploaded
    if (!req.files?.logo || !req.files?.license) {
      return next(createError(400, 'Both logo and license files are required'));
    }
    
    next();
  });
};

module.exports = {
  upload,
  handleUpload,
  uploadSettings // Export settings for reference
};