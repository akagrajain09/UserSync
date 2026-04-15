const { validationResult } = require('express-validator');
const User = require('../models/User');

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};


const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }


  if (req.user.role === 'manager') {
    filter.role = { $ne: 'admin' };
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};


const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (req.user.role === 'manager' && user.role === 'admin') {
    return res.status(403).json({ message: 'Access denied.' });
  }

  res.json({ user });
};


const createUser = async (req, res) => {
  if (handleValidationErrors(req, res)) return;

  const { name, email, password, role, status } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use.' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    status: status || 'active',
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json({ message: 'User created successfully.', user });
};


const updateUser = async (req, res) => {
  if (handleValidationErrors(req, res)) return;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Managers cannot edit admins or change roles
  if (req.user.role === 'manager') {
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Managers cannot edit admin accounts.' });
    }
    if (req.body.role) {
      return res.status(403).json({ message: 'Managers cannot change user roles.' });
    }
  }

  const allowedFields = ['name', 'email', 'password', 'role', 'status'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  user.updatedBy = req.user._id;

  await user.save();

  const updated = await User.findById(user._id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  res.json({ message: 'User updated successfully.', user: updated });
};


const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }

  // Soft delete — deactivate
  user.status = 'inactive';
  user.updatedBy = req.user._id;
  await user.save();

  res.json({ message: 'User deactivated successfully.' });
};


const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  res.json({ user });
};


const updateMyProfile = async (req, res) => {
  if (handleValidationErrors(req, res)) return;

  const user = await User.findById(req.user._id);

  const allowedFields = ['name', 'password'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  user.updatedBy = req.user._id;
  await user.save();

  const updated = await User.findById(user._id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  res.json({ message: 'Profile updated successfully.', user: updated });
};


const getUserStats = async (req, res) => {
  const [total, admins, managers, users, active, inactive] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'manager' }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'inactive' }),
  ]);

  res.json({ total, admins, managers, users, active, inactive });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
  getUserStats,
};
