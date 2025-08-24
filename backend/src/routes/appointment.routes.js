const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Appointment = require('../models/appointment.model');
const Service = require('../models/service.model');
const Salon = require('../models/salon.model');
const User = require('../models/user.model');

// Check appointment availability
router.get('/availability', async (req, res, next) => {
  try {
    const { serviceId, staffId, date } = req.query;

    if (!serviceId || !staffId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Service ID, staff ID, and date are required'
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const staff = await User.findOne({ _id: staffId, role: 'staff' });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Get salon's business hours for the given date
    const salon = await Salon.findById(service.salon);
    const dayOfWeek = new Date(date).toLocaleLowerCase();
    const businessHours = salon.businessHours[dayOfWeek];

    if (!businessHours || !businessHours.open || !businessHours.close) {
      return res.status(400).json({
        success: false,
        message: 'Salon is closed on this day'
      });
    }

    // Get all appointments for the staff on the given date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      staff: staffId,
      datetime: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no_show'] }
    }).sort('datetime');

    // Generate available time slots
    const slots = [];
    const [openHour, openMinute] = businessHours.open.split(':');
    const [closeHour, closeMinute] = businessHours.close.split(':');
    
    let currentTime = new Date(date);
    currentTime.setHours(parseInt(openHour), parseInt(openMinute), 0, 0);
    
    const closeTime = new Date(date);
    closeTime.setHours(parseInt(closeHour), parseInt(closeMinute), 0, 0);

    while (currentTime < closeTime) {
      const slotEnd = new Date(currentTime.getTime() + service.duration * 60000);
      
      // Check if slot conflicts with any existing appointment
      const hasConflict = appointments.some(apt => {
        const aptEnd = new Date(apt.datetime.getTime() + apt.duration * 60000);
        return (currentTime < aptEnd && slotEnd > apt.datetime);
      });

      if (!hasConflict && slotEnd <= closeTime) {
        slots.push(currentTime.toISOString());
      }

      // Move to next slot (30-minute intervals)
      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }

    res.json({
      success: true,
      data: {
        availableSlots: slots,
        serviceDuration: service.duration
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create new appointment
router.post('/', auth, async (req, res, next) => {
  try {
    const { serviceId, staffId, datetime } = req.body;

    // Validate service and staff
    const [service, staff] = await Promise.all([
      Service.findById(serviceId),
      User.findOne({ _id: staffId, role: 'staff' })
    ]);

    if (!service || !staff) {
      return res.status(404).json({
        success: false,
        message: 'Service or staff member not found'
      });
    }

    // Check if slot is available
    const appointmentEnd = new Date(new Date(datetime).getTime() + service.duration * 60000);
    const conflictingAppointment = await Appointment.findOne({
      staff: staffId,
      status: { $nin: ['cancelled', 'no_show'] },
      $or: [
        {
          $and: [
            { datetime: { $lt: appointmentEnd } },
            {
              $expr: {
                $gt: [
                  { $add: ['$datetime', { $multiply: ['$duration', 60000] }] },
                  { $toDate: datetime }
                ]
              }
            }
          ]
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is no longer available'
      });
    }

    const appointment = new Appointment({
      customer: req.user._id,
      service: serviceId,
      staff: staffId,
      salon: service.salon,
      datetime: new Date(datetime),
      duration: service.duration,
      price: service.discountedPrice || service.price,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: req.body.paymentMethod || 'cash'
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// Get user's appointments
router.get('/my-appointments', auth, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customer: req.user._id };

    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('service', 'name price duration')
      .populate('staff', 'name')
      .populate('salon', 'name address contactNumber')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ datetime: -1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
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

// Get staff's appointments
router.get('/staff-appointments', [auth], async (req, res, next) => {
  try {
    if (req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff only.'
      });
    }

    const { status, date, page = 1, limit = 10 } = req.query;
    const query = { staff: req.user._id };

    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.datetime = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('customer', 'name contactNumber')
      .populate('service', 'name price duration')
      .populate('salon', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ datetime: 1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
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

// Update appointment status
router.patch('/:id/status', auth, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('salon', 'owner')
      .populate('service');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isAuthorized = 
      req.user.role === 'superadmin' ||
      appointment.salon.owner.toString() === req.user._id.toString() ||
      appointment.staff.toString() === req.user._id.toString() ||
      (req.user.role === 'customer' && 
       appointment.customer.toString() === req.user._id.toString() && 
       req.body.status === 'cancelled');

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled', 'no_show'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      no_show: []
    };

    if (!validTransitions[appointment.status].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${appointment.status} to ${req.body.status}`
      });
    }

    appointment.status = req.body.status;
    if (req.body.status === 'cancelled') {
      appointment.cancellation = {
        reason: req.body.reason,
        cancelledBy: req.user._id,
        cancelledAt: new Date()
      };
    }

    await appointment.save();

    // TODO: Send notification to affected parties

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// Add rating and review
router.post('/:id/rating', auth, async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      customer: req.user._id,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Completed appointment not found'
      });
    }

    if (appointment.rating) {
      return res.status(400).json({
        success: false,
        message: 'Rating already submitted for this appointment'
      });
    }

    const { score, review } = req.body;

    appointment.rating = {
      score,
      review,
      createdAt: new Date()
    };

    await appointment.save();

    // Update service rating
    const service = await Service.findById(appointment.service);
    service.averageRating = (
      (service.averageRating * service.numberOfRatings + score) /
      (service.numberOfRatings + 1)
    );
    service.numberOfRatings += 1;
    await service.save();

    // Update salon rating
    const salon = await Salon.findById(appointment.salon);
    salon.rating.average = (
      (salon.rating.average * salon.rating.count + score) /
      (salon.rating.count + 1)
    );
    salon.rating.count += 1;
    await salon.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;