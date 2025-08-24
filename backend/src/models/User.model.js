const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters']
  },
  role: { 
    type: String, 
    enum: ['superadmin', 'salonowner', 'customer', 'staff'],
    default: 'customer'
  },
  // Salon-specific fields
  salonName: { type: String },
  contactNumber: { 
    type: String,
    validate: {
      validator: function(v) {
        if (this.role === 'salonowner') {
          return v && v.length >= 10 && /^\+?[1-9]\d{9,14}$/.test(v);
        }
        return true;
      },
      message: props => 'Contact number is required for salon owners and must be valid'
    }
  },
  description: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'India' }
  },
  logoUrl: { type: String },
  licenseUrl: { type: String },
  isApproved: { type: Boolean, default: false },
  rejectionReason: { type: String },
  // Add other fields as needed
}, { timestamps: true });

// Password hashing disabled per requirements.
// Keep hook as no-op to avoid accidental hashing and preserve compatibility.
userSchema.pre('save', async function(next) {
  return next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);