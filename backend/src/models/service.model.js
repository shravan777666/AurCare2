const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Service name is required'],
    trim: true,
    minlength: [2, 'Service name must be at least 2 characters'],
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [5, 'Duration must be at least 5 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salon',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'haircut',
      'coloring',
      'styling',
      'treatment',
      'facial',
      'makeup',
      'manicure',
      'pedicure',
      'massage',
      'other'
    ]
  },
  image: {
    url: String,
    alt: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  specialOffer: {
    isActive: { type: Boolean, default: false },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    validUntil: Date
  },
  requiredStaffQualification: [{
    type: String,
    enum: ['junior', 'senior', 'expert', 'specialist']
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numberOfRatings: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  additionalInfo: {
    preparation: String,
    aftercare: String,
    restrictions: [String]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating discounted price
serviceSchema.virtual('discountedPrice').get(function() {
  if (this.specialOffer.isActive && 
      this.specialOffer.validUntil > new Date() && 
      this.specialOffer.discountPercentage > 0) {
    return this.price * (1 - this.specialOffer.discountPercentage / 100);
  }
  return this.price;
});

// Index for text search
serviceSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Compound index for efficient querying
serviceSchema.index({ salon: 1, category: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);