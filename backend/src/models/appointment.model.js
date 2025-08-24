const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  datetime: {
    type: Date,
    required: [true, 'Appointment date and time is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Appointment date must be in the future'
    }
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salon',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: [5, 'Duration must be at least 5 minutes']
  },
  notes: {
    customer: String,
    staff: String
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date
  },
  reminder: {
    isEnabled: {
      type: Boolean,
      default: true
    },
    sentAt: Date
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    required: true
  },
  specialRequests: [String],
  checkin: {
    time: Date,
    status: {
      type: String,
      enum: ['pending', 'on_time', 'late', 'very_late'],
      default: 'pending'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for appointment end time
appointmentSchema.virtual('endTime').get(function() {
  return new Date(this.datetime.getTime() + this.duration * 60000);
});

// Compound index for efficient querying
appointmentSchema.index({ salon: 1, staff: 1, datetime: 1 });
appointmentSchema.index({ customer: 1, datetime: 1 });
appointmentSchema.index({ status: 1, datetime: 1 });

// Middleware to validate appointment slots
appointmentSchema.pre('save', async function(next) {
  if (this.isModified('datetime') || this.isModified('staff') || this.isModified('duration')) {
    const overlappingAppointment = await this.constructor.findOne({
      staff: this.staff,
      _id: { $ne: this._id },
      datetime: {
        $lt: new Date(this.datetime.getTime() + this.duration * 60000),
        $gt: this.datetime
      },
      status: { $nin: ['cancelled', 'no_show'] }
    });

    if (overlappingAppointment) {
      next(new Error('This time slot is already booked for the selected staff member'));
    }
  }
  next();
});

// Middleware to update service availability after status change
appointmentSchema.post('save', async function() {
  if (this.isModified('status')) {
    // Update staff availability or service booking stats if needed
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);