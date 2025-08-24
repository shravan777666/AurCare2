const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Service = require('../models/service.model');
const Salon = require('../models/salon.model');

// Middleware to check if user can manage service
const canManageService = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.body.salon || req.params.salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    if (req.user.role === 'superadmin' || 
        salon.owner.toString() === req.user._id.toString()) {
      req.salon = salon;
      return next();
    }

    res.status(403).json({
      success: false,
      message: 'Access denied. Not authorized to manage services'
    });
  } catch (error) {
    next(error);
  }
};

// Create a new service
router.post('/', [auth, canManageService], async (req, res, next) => {
  try {
    const service = new Service({
      ...req.body,
      salon: req.salon._id
    });

    await service.save();

    // Add service to salon's services array
    await Salon.findByIdAndUpdate(req.salon._id, {
      $push: { services: service._id }
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
});

// Get all services for a salon
router.get('/salon/:salonId', async (req, res, next) => {
  try {
    const { 
      category,
      minPrice,
      maxPrice,
      duration,
      page = 1,
      limit = 10
    } = req.query;

    const query = { salon: req.params.salonId, isActive: true };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (duration) query.duration = parseInt(duration);

    const services = await Service.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ category: 1, price: 1 });

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
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

// Get service by ID
router.get('/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('salon', 'name address contactNumber');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
});

// Update service
router.put('/:id', [auth], async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('salon', 'owner');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user is owner or superadmin
    if (req.user.role !== 'superadmin' && 
        service.salon.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not authorized to update this service'
      });
    }

    // Prevent updating salon
    delete req.body.salon;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    next(error);
  }
});

// Delete service
router.delete('/:id', [auth], async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('salon', 'owner');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user is owner or superadmin
    if (req.user.role !== 'superadmin' && 
        service.salon.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not authorized to delete this service'
      });
    }

    // Remove service from salon's services array
    await Salon.findByIdAndUpdate(service.salon._id, {
      $pull: { services: service._id }
    });

    await service.remove();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Add special offer to service
router.post('/:id/special-offer', [auth], async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('salon', 'owner');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user is owner or superadmin
    if (req.user.role !== 'superadmin' && 
        service.salon.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not authorized to add special offer'
      });
    }

    const { discountPercentage, validUntil } = req.body;

    service.specialOffer = {
      isActive: true,
      discountPercentage,
      validUntil: new Date(validUntil)
    };

    await service.save();

    res.json({
      success: true,
      message: 'Special offer added successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
});

// Remove special offer from service
router.delete('/:id/special-offer', [auth], async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('salon', 'owner');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user is owner or superadmin
    if (req.user.role !== 'superadmin' && 
        service.salon.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not authorized to remove special offer'
      });
    }

    service.specialOffer = {
      isActive: false,
      discountPercentage: 0,
      validUntil: null
    };

    await service.save();

    res.json({
      success: true,
      message: 'Special offer removed successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;