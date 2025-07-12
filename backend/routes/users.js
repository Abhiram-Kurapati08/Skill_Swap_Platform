const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  validateProfileUpdate, 
  validateSkill, 
  validatePagination, 
  validateObjectId 
} = require('../middleware/validation');
const {
  getUsers,
  getUserById,
  updateProfile,
  addOfferedSkill,
  addWantedSkill,
  removeOfferedSkill,
  removeWantedSkill,
  getUserStats
} = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users (public profiles only)
// @access  Private
router.get('/', validatePagination, getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', validateObjectId, getUserById);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', validateProfileUpdate, updateProfile);

// @route   POST /api/users/skills/offered
// @desc    Add skill to offered skills
// @access  Private
router.post('/skills/offered', validateSkill, addOfferedSkill);

// @route   POST /api/users/skills/wanted
// @desc    Add skill to wanted skills
// @access  Private
router.post('/skills/wanted', validateSkill, addWantedSkill);

// @route   DELETE /api/users/skills/offered/:skillId
// @desc    Remove skill from offered skills
// @access  Private
router.delete('/skills/offered/:skillId', removeOfferedSkill);

// @route   DELETE /api/users/skills/wanted/:skillId
// @desc    Remove skill from wanted skills
// @access  Private
router.delete('/skills/wanted/:skillId', removeWantedSkill);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', getUserStats);

module.exports = router; 