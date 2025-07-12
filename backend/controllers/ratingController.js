const Rating = require('../models/Rating');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create a rating for a completed swap
// @route   POST /api/ratings
// @access  Private
const createRating = async (req, res) => {
  try {
    const { swapRequestId, rating, comment, skillRated } = req.body;

    // Check if swap request exists and is completed
    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swapRequest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed swaps'
      });
    }

    // Check if user is involved in this swap
    if (swapRequest.requester.toString() !== req.user._id.toString() && 
        swapRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate swaps you participated in'
      });
    }

    // Determine the user being rated
    const ratedUserId = req.user._id.toString() === swapRequest.requester.toString() 
      ? swapRequest.recipient 
      : swapRequest.requester;

    // Check if user has already rated this swap
    const existingRating = await Rating.findOne({
      swapRequest: swapRequestId,
      rater: req.user._id
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this swap'
      });
    }

    // Create the rating
    const newRating = new Rating({
      swapRequest: swapRequestId,
      rater: req.user._id,
      ratedUser: ratedUserId,
      rating,
      comment,
      skillRated
    });

    await newRating.save();

    // Update user's average rating
    await updateUserAverageRating(ratedUserId);

    // Mark swap as rated
    swapRequest.isRated = true;
    await swapRequest.save();

    // Populate user details for response
    await newRating.populate('rater', 'name profilePhotoUrl');
    await newRating.populate('ratedUser', 'name profilePhotoUrl');

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'rating_given',
      details: { 
        ratedUserId,
        rating,
        skillRated: skillRated.name
      },
      targetUser: ratedUserId,
      targetSwap: swapRequestId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: newRating
      }
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating rating'
    });
  }
};

// @desc    Get ratings for a user
// @route   GET /api/ratings/user/:userId
// @access  Private
const getUserRatings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const ratings = await Rating.find({ ratedUser: userId })
      .populate('rater', 'name profilePhotoUrl')
      .populate('swapRequest', 'requestedSkill offeredSkill')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ ratedUser: userId });

    // Get average rating
    const avgRating = await Rating.getAverageRating(userId);

    res.json({
      success: true,
      data: {
        ratings,
        averageRating: avgRating.averageRating,
        totalRatings: avgRating.totalRatings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRatings: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings'
    });
  }
};

// @desc    Get rating by ID
// @route   GET /api/ratings/:id
// @access  Private
const getRatingById = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id)
      .populate('rater', 'name profilePhotoUrl')
      .populate('ratedUser', 'name profilePhotoUrl')
      .populate('swapRequest', 'requestedSkill offeredSkill');

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user has permission to view this rating
    if (rating.rater._id.toString() !== req.user._id.toString() && 
        rating.ratedUser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        rating
      }
    });
  } catch (error) {
    console.error('Get rating by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rating'
    });
  }
};

// @desc    Update rating
// @route   PUT /api/ratings/:id
// @access  Private
const updateRating = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const existingRating = await Rating.findById(req.params.id);
    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user is the one who created the rating
    if (existingRating.rater.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own ratings'
      });
    }

    // Update rating
    existingRating.rating = rating;
    existingRating.comment = comment;
    await existingRating.save();

    // Update user's average rating
    await updateUserAverageRating(existingRating.ratedUser);

    // Populate user details for response
    await existingRating.populate('rater', 'name profilePhotoUrl');
    await existingRating.populate('ratedUser', 'name profilePhotoUrl');

    res.json({
      success: true,
      message: 'Rating updated successfully',
      data: {
        rating: existingRating
      }
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating rating'
    });
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
// @access  Private
const deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user is the one who created the rating
    if (rating.rater.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own ratings'
      });
    }

    const ratedUserId = rating.ratedUser;
    await rating.deleteOne();

    // Update user's average rating
    await updateUserAverageRating(ratedUserId);

    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting rating'
    });
  }
};

// @desc    Get user's own ratings
// @route   GET /api/ratings/my-ratings
// @access  Private
const getMyRatings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ rater: req.user._id })
      .populate('ratedUser', 'name profilePhotoUrl')
      .populate('swapRequest', 'requestedSkill offeredSkill')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ rater: req.user._id });

    res.json({
      success: true,
      data: {
        ratings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRatings: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your ratings'
    });
  }
};

// Helper function to update user's average rating
const updateUserAverageRating = async (userId) => {
  try {
    const avgRating = await Rating.getAverageRating(userId);
    
    await User.findByIdAndUpdate(userId, {
      averageRating: avgRating.averageRating,
      totalRatings: avgRating.totalRatings
    });
  } catch (error) {
    console.error('Error updating user average rating:', error);
  }
};

module.exports = {
  createRating,
  getUserRatings,
  getRatingById,
  updateRating,
  deleteRating,
  getMyRatings
}; 