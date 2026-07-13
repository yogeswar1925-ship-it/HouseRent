const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Get all properties (with filters)
// @route   GET /api/properties
// @access  Public
router.get('/', async (req, res) => {
  const { type, adType, search } = req.query;
  let query = {};

  if (type && type !== 'All Types') {
    query.type = type;
  }

  if (adType && adType !== 'All Ad Types') {
    query.adType = adType;
  }

  if (search) {
    query.address = { $regex: search, $options: 'i' };
  }

  try {
    const properties = await Property.find(query).populate('owner', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get properties owned by the current user
// @route   GET /api/properties/owner
// @access  Private (Owner Only)
router.get('/owner', protect, async (req, res) => {
  if (req.user.userType !== 'Owner') {
    return res.status(403).json({ message: 'Only owners can access this route' });
  }

  try {
    const properties = await Property.find({ owner: req.user._id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (Owner/Admin)
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  if (req.user.userType !== 'Owner' && req.user.userType !== 'Admin') {
    return res.status(403).json({ message: 'Only owners or admins can create properties' });
  }

  const { type, adType, address, contactNo, amount, additionalDetails } = req.body;

  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const property = await Property.create({
      type,
      adType,
      address,
      images,
      contactNo,
      amount: Number(amount),
      additionalDetails,
      owner: req.user._id,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Toggle property availability
// @route   PATCH /api/properties/:id/status
// @access  Private (Owner/Admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.userType !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized to manage this property' });
    }

    // Toggle status
    property.status = property.status === 'Available' ? 'Not Available' : 'Available';
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.userType !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized to update this property' });
    }

    const { type, adType, address, contactNo, amount, additionalDetails, status } = req.body;

    if (type) property.type = type;
    if (adType) property.adType = adType;
    if (address) property.address = address;
    if (contactNo) property.contactNo = contactNo;
    if (amount) property.amount = Number(amount);
    if (additionalDetails !== undefined) property.additionalDetails = additionalDetails;
    if (status) property.status = status;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      property.images = newImages;
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.userType !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized to delete this property' });
    }

    // Delete property
    await Property.findByIdAndDelete(req.params.id);

    // Also delete any booking requests associated with this property
    await Booking.deleteMany({ property: req.params.id });

    res.json({ message: 'Property and associated bookings deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
