const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

// @desc    Create a booking request for a property
// @route   POST /api/bookings
// @access  Private (Renter Only)
router.post('/', protect, async (req, res) => {
  if (req.user.userType !== 'Renter') {
    return res.status(403).json({ message: 'Only Renters can request bookings' });
  }

  const { propertyId } = req.body;

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'Available') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    const booking = await Booking.create({
      property: propertyId,
      renter: req.user._id,
      owner: property.owner,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all bookings for the logged-in renter
// @route   GET /api/bookings/renter
// @access  Private (Renter Only)
router.get('/renter', protect, async (req, res) => {
  if (req.user.userType !== 'Renter') {
    return res.status(403).json({ message: 'Only renters can view their bookings' });
  }

  try {
    const bookings = await Booking.find({ renter: req.user._id })
      .populate('property')
      .populate('owner', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all bookings for properties owned by the owner
// @route   GET /api/bookings/owner
// @access  Private (Owner Only)
router.get('/owner', protect, async (req, res) => {
  if (req.user.userType !== 'Owner') {
    return res.status(403).json({ message: 'Only owners can view received bookings' });
  }

  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('property')
      .populate('renter', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update booking status (Approve / Reject)
// @route   PATCH /api/bookings/:id
// @access  Private (Owner Only)
router.patch('/:id', protect, async (req, res) => {
  if (req.user.userType !== 'Owner') {
    return res.status(403).json({ message: 'Only owners can update bookings' });
  }

  const { status } = req.body; // Approved or Rejected
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid booking status update' });
  }

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to manage this booking' });
    }

    booking.status = status;
    await booking.save();

    // If approved, we can set the property to Not Available
    if (status === 'Approved') {
      const property = await Property.findById(booking.property);
      if (property) {
        property.status = 'Not Available';
        await property.save();
      }
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
