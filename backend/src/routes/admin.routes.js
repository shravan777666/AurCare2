const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User.model');
const Salon = require('../models/salon.model');

// Middleware to check if user is SuperAdmin
const isSuperAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. SuperAdmin privileges required.'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Get all pending salon owner approvals (exclude rejected)
router.get('/owners/pending', [auth, isSuperAdmin], async (req, res, next) => {
  try {
    const pendingOwners = await User.find({
      role: 'salonowner',
      isApproved: false,
      $or: [
        { rejectionReason: { $exists: false } },
        { rejectionReason: null },
        { rejectionReason: '' }
      ]
    }).select('-password');

    res.json({
      success: true,
      data: pendingOwners
    });
  } catch (error) {
    next(error);
  }
});

// Get all salon owners (approved and pending)
router.get('/owners', [auth, isSuperAdmin], async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { role: 'salonowner' };

    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;

    const owners = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: owners,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Approve or reject salon owner
router.patch('/owners/:id/approval', [auth, isSuperAdmin], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved, reason } = req.body;

    const owner = await User.findOne({ _id: id, role: 'salonowner' });
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Salon owner not found'
      });
    }

    if (isApproved === true) {
      owner.isApproved = true;
      owner.rejectionReason = undefined; // clear any previous rejection
    } else {
      owner.isApproved = false;
      owner.rejectionReason = reason || 'Rejected by admin';
    }

    await owner.save();

    res.json({
      success: true,
      message: `Salon owner ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: owner
    });
  } catch (error) {
    next(error);
  }
});

// Get system statistics
router.get('/statistics', [auth, isSuperAdmin], async (req, res, next) => {
  try {
    const [totalSalons, totalCustomers, totalAppointments, pendingApprovals] = await Promise.all([
      Salon.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'customer' }),
      require('../models/appointment.model').countDocuments(),
      User.countDocuments({ role: 'salonowner', isApproved: false })
    ]);

    res.json({
      success: true,
      data: {
        totalSalons,
        totalCustomers,
        totalAppointments,
        pendingApprovals
      }
    });
  } catch (error) {
    next(error);
  }
});

// Suspend or reactivate salon
router.patch('/salons/:id/status', [auth, isSuperAdmin], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either active or suspended.'
      });
    }

    const salon = await Salon.findById(id);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    salon.status = status;
    salon.statusReason = reason;
    salon.statusUpdatedAt = new Date();
    salon.statusUpdatedBy = req.user._id;

    await salon.save();

    // TODO: Send notification to salon owner about status change

    res.json({
      success: true,
      message: `Salon ${status === 'active' ? 'reactivated' : 'suspended'} successfully`,
      data: salon
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;