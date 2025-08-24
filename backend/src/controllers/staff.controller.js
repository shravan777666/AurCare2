const createError = require('http-errors');
const User = require('../models/User.model');
const Salon = require('../models/salon.model');
const StaffInvitation = require('../models/staffInvitation.model');

// Owner: list all registered staff (optionally filter by search)
exports.listAllStaff = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    const query = {
      role: 'staff',
      $or: [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') }
      ]
    };
    const staff = await User.find(query)
      .select('name email contactNumber createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();
    const total = await User.countDocuments(query);
    res.json({ success: true, data: staff, pagination: { total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// Owner: send invite to staff for a specific salon
exports.sendInvite = async (req, res, next) => {
  try {
    const { salonId, staffId, message } = req.body;
    if (!salonId || !staffId) throw createError(400, 'salonId and staffId are required');

    const salon = await Salon.findOne({ _id: salonId, owner: req.user._id });
    if (!salon) throw createError(404, 'Salon not found or not owned by you');

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') throw createError(404, 'Staff not found');

    // Prevent duplicate active invites for same pair
    const existing = await StaffInvitation.findOne({ salon: salon._id, owner: req.user._id, staff: staff._id, status: { $in: ['sent', 'accepted'] } });
    if (existing) throw createError(409, 'Existing pending invitation for this staff');

    const invite = await StaffInvitation.create({ salon: salon._id, owner: req.user._id, staff: staff._id, message });
    res.status(201).json({ success: true, message: 'Invitation sent', data: invite });
  } catch (err) { next(err); }
};

// Staff: list my invitations
exports.listMyInvites = async (req, res, next) => {
  try {
    const invites = await StaffInvitation.find({ staff: req.user._id, status: { $in: ['sent', 'accepted'] } })
      .populate('salon', 'name address.city')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: invites });
  } catch (err) { next(err); }
};

// Staff: accept or decline
exports.respondInvite = async (req, res, next) => {
  try {
    const { id } = req.params; // invitation id
    const { action } = req.body; // 'accept' | 'decline'
    if (!['accept', 'decline'].includes(action)) throw createError(400, 'Invalid action');

    const invite = await StaffInvitation.findOne({ _id: id, staff: req.user._id, status: 'sent' });
    if (!invite) throw createError(404, 'Invitation not found or not actionable');

    invite.status = action === 'accept' ? 'accepted' : 'declined';
    await invite.save();
    res.json({ success: true, message: `Invitation ${invite.status}` });
  } catch (err) { next(err); }
};

// Owner: approve accepted invitation and attach staff to salon
exports.approveInvite = async (req, res, next) => {
  try {
    const { id } = req.params; // invitation id
    const invite = await StaffInvitation.findOne({ _id: id, owner: req.user._id, status: 'accepted' });
    if (!invite) throw createError(404, 'No accepted invitation found');

    const salon = await Salon.findOne({ _id: invite.salon, owner: req.user._id });
    if (!salon) throw createError(404, 'Salon not found');

    // Add staff to salon if not present
    if (!salon.staff.map(s => s.toString()).includes(invite.staff.toString())) {
      salon.staff.push(invite.staff);
      await salon.save();
    }

    invite.status = 'approved';
    await invite.save();
    res.json({ success: true, message: 'Staff approved and added to salon' });
  } catch (err) { next(err); }
};

// Owner: revoke a sent or accepted invitation
exports.revokeInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await StaffInvitation.findOne({ _id: id, owner: req.user._id, status: { $in: ['sent', 'accepted'] } });
    if (!invite) throw createError(404, 'Invitation not revocable');
    invite.status = 'revoked';
    await invite.save();
    res.json({ success: true, message: 'Invitation revoked' });
  } catch (err) { next(err); }
};

// Owner: view invitations for my salon(s)
exports.listSalonInvites = async (req, res, next) => {
  try {
    const { salonId } = req.query; // optional
    const salonFilter = salonId ? { _id: salonId, owner: req.user._id } : { owner: req.user._id };
    const salons = await Salon.find(salonFilter).select('_id');
    const salonIds = salons.map(s => s._id);
    const invites = await StaffInvitation.find({ salon: { $in: salonIds } })
      .populate('staff', 'name email')
      .populate('salon', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: invites });
  } catch (err) { next(err); }
};