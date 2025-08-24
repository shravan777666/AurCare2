const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Salon name is required'],
    trim: true,
    minlength: [2, 'Salon name must be at least 2 characters'],
    maxlength: [100, 'Salon name cannot exceed 100 characters']
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^\+?[1-9]\d{9,14}$/, 'Please enter a valid contact number']
  },
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  images: [{
    url: String,
    caption: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  features: [{
    type: String,
    enum: ['parking', 'wifi', 'card_payment', 'wheelchair_accessible']
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for generating full address
salonSchema.virtual('fullAddress').get(function() {
  const { street, city, state, zipCode, country } = this.address;
  return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
});

// Index for geospatial queries
salonSchema.index({ 'address.coordinates': '2dsphere' });

// Index for text search
salonSchema.index({
  name: 'text',
  'address.city': 'text',
  'address.state': 'text',
  description: 'text'
});

module.exports = mongoose.model('Salon', salonSchema);