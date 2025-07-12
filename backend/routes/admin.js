const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const { 
  validateBanUser, 
  validatePagination, 
  validateObjectId 
} = require('../middleware/validation');
const {
  getAllUsers,
  banUser,
  unbanUser,
  getAllSwapRequests,
  getDashboardStats,
  getActivityLogs,
  exportActivityLogs,
  moderateSkill
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(auth, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', validatePagination, getAllUsers);

// @route   POST /api/admin/users/ban
// @desc    Ban user
// @access  Private/Admin
router.post('/users/ban', validateBanUser, banUser);

// @route   POST /api/admin/users/unban
// @desc    Unban user
// @access  Private/Admin
router.post('/users/unban', unbanUser);

// @route   GET /api/admin/swaps
// @desc    Get all swap requests (admin only)
// @access  Private/Admin
router.get('/swaps', validatePagination, getAllSwapRequests);

// @route   GET /api/admin/activity-logs
// @desc    Get activity logs
// @access  Private/Admin
router.get('/activity-logs', validatePagination, getActivityLogs);

// @route   GET /api/admin/export-logs
// @desc    Export activity logs to CSV
// @access  Private/Admin
router.get('/export-logs', exportActivityLogs);

// @route   PUT /api/admin/moderate-skill
// @desc    Moderate skill description
// @access  Private/Admin
router.put('/moderate-skill', moderateSkill);

module.exports = router; 