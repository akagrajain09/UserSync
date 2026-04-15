const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ message: 'Your account has been deactivated. Contact an admin.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();

  const refreshExpiry = new Date();
  refreshExpiry.setDate(refreshExpiry.getDate() + 7);

  await RefreshToken.create({
    token: rawRefreshToken,
    userId: user._id,
    expiresAt: refreshExpiry,
  });


  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    accessToken,
    refreshToken: rawRefreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
    },
  });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }

  const stored = await RefreshToken.findOne({
    token: refreshToken,
    isRevoked: false,
  });

  if (!stored || stored.expiresAt < new Date()) {
    return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }

  const user = await User.findById(stored.userId);
  if (!user || user.status === 'inactive') {
    return res.status(401).json({ message: 'User not found or inactive.' });
  }

  const accessToken = generateAccessToken(user);

  res.json({ accessToken });
};


const logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { isRevoked: true }
    );
  }

  res.json({ message: 'Logged out successfully.' });
};


const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, refresh, logout, getMe };
