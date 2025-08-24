const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Salon = require('../models/salon.model');
const User = require('../models/user.model');

// Middleware to check if user is salon owner
const isSalonOwner = async (req, res, next) => {
  try {
    if (req.user.role !== 'salonowner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Salon owner privileges required.'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Create a new salon
router.post('/', [auth, isSalonOwner], async (req, res, next) => {
  try {
    // Check if owner already has a salon
    const existingSalon = await Salon.findOne({ owner: req.user._id });
    if (existingSalon) {
      return res.status(400).json({
        success: false,
        message: 'You already have a registered salon'
      });
    }

    const salon = new Salon({
      ...req.body,
      owner: req.user._id
    });

    await salon.save();

    res.status(201).json({
      success: true,
      message: 'Salon created successfully',
      data: salon
    });
  } catch (error) {
    next(error);
  }
});

// Get all salons (with filters)
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      city,
      category,
      rating,
      priceRange,
      features,
      search
    } = req.query;

    const query = { status: 'active' };

    // Apply filters
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (rating) query['rating.average'] = { $gte: parseFloat(rating) };
    if (features) query.features = { $all: features.split(',') };
    if (search) {
      query.$text = { $search: search };
    }

    const salons = await Salon.find(query)
      .populate('owner', 'name email contactNumber')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ 'rating.average': -1, createdAt: -1 });

    const total = await Salon.countDocuments(query);

    res.json({
      success: true,
      data: salons,
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

// Get salon by ID
router.get('/:id', async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id)
      .populate('owner', 'name email contactNumber')
      .populate('services')
      .populate('staff', 'name email');

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    res.json({
      success: true,
      data: salon
    });
  } catch (error) {
    next(error);
  }
});

// Update salon
router.put('/:id', [auth], async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    // Check if user is owner or superadmin
    if (req.user.role !== 'superadmin' && salon.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not authorized to update this salon'
      });
    }

    // Prevent updating owner
    delete req.body.owner;
    delete req.body.status;

    const updatedSalon = await Salon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Salon updated successfully',
      data: updatedSalon
    });
  } catch (error) {
    next(error);
  }
});

// Add staff to salon (Deprecated): Now use invitations flow under /api/staff
router.post('/:id/staff', [auth, isSalonOwner], async (req, res, next) => {
  try {
    return res.status(410).json({
      success: false,
      message: 'Deprecated. Use /api/staff/invites to invite staff and approval workflow.'
    });
  } catch (error) {
    next(error);
  }
});

// Remove staff from salon
router.delete('/:id/staff/:staffId', [auth, isSalonOwner], async (req, res, next) => {
  try {
    const salon = await Salon.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found or you are not the owner'
      });
    }

    salon.staff = salon.staff.filter(id => id.toString() !== req.params.staffId);
    await salon.save();

    res.json({
      success: true,
      message: 'Staff removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get salon statistics
router.get('/:id/statistics', [auth], async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    // Check if user is owner, staff, or superadmin
    if (req.user.role !== 'superadmin' && 
        salon.owner.toString() !== req.user._id.toString() && 
        !salon.staff.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const Appointment = require('../models/appointment.model');
    
    const [totalAppointments, completedAppointments, cancelledAppointments, revenue] = await Promise.all([
      Appointment.countDocuments({ salon: salon._id }),
      Appointment.countDocuments({ salon: salon._id, status: 'completed' }),
      Appointment.countDocuments({ salon: salon._id, status: 'cancelled' }),
      Appointment.aggregate([
        { $match: { salon: salon._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        revenue: revenue[0]?.total || 0,
        rating: salon.rating
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;