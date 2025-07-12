const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  validateSwapRequest, 
  validatePagination, 
  validateObjectId 
} = require('../middleware/validation');
const {
  createSwapRequest,
  getSwapRequests,
  getSwapRequestById,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  completeSwapRequest
} = require('../controllers/swapController');

// @route   POST /api/swaps
// @desc    Create a new swap request
// @access  Private
router.post('/', validateSwapRequest, createSwapRequest);

// @route   GET /api/swaps
// @desc    Get user's swap requests
// @access  Private
router.get('/', validatePagination, getSwapRequests);

// @route   GET /api/swaps/:id
// @desc    Get swap request by ID
// @access  Private
router.get('/:id', validateObjectId, getSwapRequestById);

// @route   PUT /api/swaps/:id/accept
// @desc    Accept swap request
// @access  Private
router.put('/:id/accept', validateObjectId, acceptSwapRequest);

// @route   PUT /api/swaps/:id/reject
// @desc    Reject swap request
// @access  Private
router.put('/:id/reject', validateObjectId, rejectSwapRequest);

// @route   PUT /api/swaps/:id/cancel
// @desc    Cancel swap request
// @access  Private
router.put('/:id/cancel', validateObjectId, cancelSwapRequest);

// @route   PUT /api/swaps/:id/complete
// @desc    Complete swap request
// @access  Private
router.put('/:id/complete', validateObjectId, completeSwapRequest);

module.exports = router; 