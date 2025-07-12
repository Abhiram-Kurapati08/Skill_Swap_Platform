const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  validateRating, 
  validatePagination, 
  validateObjectId 
} = require('../middleware/validation');
const {
  createRating,
  getUserRatings,
  getRatingById,
  updateRating,
  deleteRating,
  getMyRatings
} = require('../controllers/ratingController');

// @route   POST /api/ratings
// @desc    Create a rating for a completed swap
// @access  Private
router.post('/', validateRating, createRating);

// @route   GET /api/ratings/my-ratings
// @desc    Get user's own ratings
// @access  Private
router.get('/my-ratings', validatePagination, getMyRatings);

// @route   GET /api/ratings/user/:userId
// @desc    Get ratings for a specific user
// @access  Private
router.get('/user/:userId', validateObjectId, validatePagination, getUserRatings);

// @route   GET /api/ratings/:id
// @desc    Get rating by ID
// @access  Private
router.get('/:id', validateObjectId, getRatingById);

// @route   PUT /api/ratings/:id
// @desc    Update rating
// @access  Private
router.put('/:id', validateObjectId, updateRating);

// @route   DELETE /api/ratings/:id
// @desc    Delete rating
// @access  Private
router.delete('/:id', validateObjectId, deleteRating);

module.exports = router; 