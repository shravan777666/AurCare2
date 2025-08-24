const mongoose = require('mongoose');

const staffInvitationSchema = new mongoose.Schema({
  salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['sent', 'accepted', 'approved', 'declined', 'revoked', 'expired'],
    default: 'sent'
  },
  message: { type: String, maxlength: 500 },
}, { timestamps: true });

staffInvitationSchema.index({ owner: 1, staff: 1, salon: 1, status: 1 });

module.exports = mongoose.model('StaffInvitation', staffInvitationSchema);