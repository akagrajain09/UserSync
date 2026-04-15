const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
  getUserStats,
} = require('../controllers/user.controller');

const { authenticate, authorize, selfOrAdmin } = require('../middleware/auth.middleware');

const {
  createUserValidation,
  updateUserValidation,
  updateProfileValidation,
  paginationValidation,
  objectIdValidation,
} = require('../validators/user.validator');

router.use(authenticate);

router.get('/stats', authorize('admin', 'manager'), getUserStats);
router.get('/me', getMyProfile);
router.put('/me', updateProfileValidation, updateMyProfile);

router.get('/', authorize('admin', 'manager'), paginationValidation, getAllUsers);

router.post('/', authorize('admin'), createUserValidation, createUser);

router.get('/:id', objectIdValidation, selfOrAdmin, getUserById);

router.put('/:id', objectIdValidation, authorize('admin', 'manager'), updateUserValidation, updateUser);

router.delete('/:id', objectIdValidation, authorize('admin'), deleteUser);

module.exports = router;
