const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
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
  contactNumber: { type: String },
  description: { type: String },
  address: { type: mongoose.Schema.Types.Mixed },
  logoUrl: { type: String },
  licenseUrl: { type: String },
  isApproved: { type: Boolean, default: false },
  // Add other fields as needed
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);