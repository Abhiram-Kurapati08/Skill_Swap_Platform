const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create a new swap request
// @route   POST /api/swaps
// @access  Private
const createSwapRequest = async (req, res) => {
  try {
    const { recipientId, requestedSkill, offeredSkill, message, scheduledDate } = req.body;

    // Check if recipient exists and is not banned
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    if (recipient.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send swap request to banned user'
      });
    }

    // Check if recipient has the requested skill
    const hasRequestedSkill = recipient.skillsOffered.some(
      skill => skill.name.toLowerCase() === requestedSkill.name.toLowerCase()
    );

    if (!hasRequestedSkill) {
      return res.status(400).json({
        success: false,
        message: 'Recipient does not offer the requested skill'
      });
    }

    // Check if requester has the offered skill
    const requester = await User.findById(req.user._id);
    const hasOfferedSkill = requester.skillsOffered.some(
      skill => skill.name.toLowerCase() === offeredSkill.name.toLowerCase()
    );

    if (!hasOfferedSkill) {
      return res.status(400).json({
        success: false,
        message: 'You do not offer the skill you are trying to swap'
      });
    }

    // Check if there's already a pending request between these users
    const existingRequest = await SwapRequest.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'There is already a pending swap request between you and this user'
      });
    }

    // Create swap request
    const swapRequest = new SwapRequest({
      requester: req.user._id,
      recipient: recipientId,
      requestedSkill,
      offeredSkill,
      message,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null
    });

    await swapRequest.save();

    // Populate user details for response
    await swapRequest.populate('requester', 'name profilePhotoUrl');
    await swapRequest.populate('recipient', 'name profilePhotoUrl');

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'swap_request_created',
      details: { 
        recipientId,
        requestedSkill: requestedSkill.name,
        offeredSkill: offeredSkill.name
      },
      targetUser: recipientId,
      targetSwap: swapRequest._id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: {
        swapRequest
      }
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating swap request'
    });
  }
};

// @desc    Get user's swap requests
// @route   GET /api/swaps
// @access  Private
const getSwapRequests = async (req, res) => {
  try {
    const { type = 'all', status, page = 1, limit = 10 } = req.query;

    let query = {};
    
    if (type === 'incoming') {
      query.recipient = req.user._id;
    } else if (type === 'outgoing') {
      query.requester = req.user._id;
    } else {
      query.$or = [{ requester: req.user._id }, { recipient: req.user._id }];
    }

    if (status) {
      query.status = status;
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name profilePhotoUrl')
      .populate('recipient', 'name profilePhotoUrl')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SwapRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        swapRequests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRequests: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap requests'
    });
  }
};

// @desc    Get swap request by ID
// @route   GET /api/swaps/:id
// @access  Private
const getSwapRequestById = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name profilePhotoUrl email')
      .populate('recipient', 'name profilePhotoUrl email');

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is involved in this swap request
    if (swapRequest.requester._id.toString() !== req.user._id.toString() && 
        swapRequest.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        swapRequest
      }
    });
  } catch (error) {
    console.error('Get swap request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap request'
    });
  }
};

// @desc    Accept swap request
// @route   PUT /api/swaps/:id/accept
// @access  Private
const acceptSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the recipient
    if (swapRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can accept a swap request'
      });
    }

    // Check if request is still pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Swap request is no longer pending'
      });
    }

    swapRequest.status = 'accepted';
    await swapRequest.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'swap_request_accepted',
      details: { 
        requesterId: swapRequest.requester,
        requestedSkill: swapRequest.requestedSkill.name,
        offeredSkill: swapRequest.offeredSkill.name
      },
      targetUser: swapRequest.requester,
      targetSwap: swapRequest._id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Swap request accepted successfully',
      data: {
        swapRequest
      }
    });
  } catch (error) {
    console.error('Accept swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting swap request'
    });
  }
};

// @desc    Reject swap request
// @route   PUT /api/swaps/:id/reject
// @access  Private
const rejectSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the recipient
    if (swapRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can reject a swap request'
      });
    }

    // Check if request is still pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Swap request is no longer pending'
      });
    }

    swapRequest.status = 'rejected';
    await swapRequest.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'swap_request_rejected',
      details: { 
        requesterId: swapRequest.requester,
        requestedSkill: swapRequest.requestedSkill.name,
        offeredSkill: swapRequest.offeredSkill.name
      },
      targetUser: swapRequest.requester,
      targetSwap: swapRequest._id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Swap request rejected successfully',
      data: {
        swapRequest
      }
    });
  } catch (error) {
    console.error('Reject swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting swap request'
    });
  }
};

// @desc    Cancel swap request
// @route   PUT /api/swaps/:id/cancel
// @access  Private
const cancelSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the requester
    if (swapRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel a swap request'
      });
    }

    // Check if request is still pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Swap request is no longer pending'
      });
    }

    swapRequest.status = 'cancelled';
    await swapRequest.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'swap_request_cancelled',
      details: { 
        recipientId: swapRequest.recipient,
        requestedSkill: swapRequest.requestedSkill.name,
        offeredSkill: swapRequest.offeredSkill.name
      },
      targetUser: swapRequest.recipient,
      targetSwap: swapRequest._id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Swap request cancelled successfully',
      data: {
        swapRequest
      }
    });
  } catch (error) {
    console.error('Cancel swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling swap request'
    });
  }
};

// @desc    Complete swap request
// @route   PUT /api/swaps/:id/complete
// @access  Private
const completeSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is involved in this swap request
    if (swapRequest.requester.toString() !== req.user._id.toString() && 
        swapRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if request is accepted
    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Swap request must be accepted before it can be completed'
      });
    }

    swapRequest.status = 'completed';
    swapRequest.completedDate = new Date();
    await swapRequest.save();

    // Update user statistics
    await User.findByIdAndUpdate(swapRequest.requester, {
      $inc: { completedSwaps: 1 }
    });
    await User.findByIdAndUpdate(swapRequest.recipient, {
      $inc: { completedSwaps: 1 }
    });

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'swap_completed',
      details: { 
        otherUserId: req.user._id.toString() === swapRequest.requester.toString() 
          ? swapRequest.recipient 
          : swapRequest.requester,
        requestedSkill: swapRequest.requestedSkill.name,
        offeredSkill: swapRequest.offeredSkill.name
      },
      targetUser: req.user._id.toString() === swapRequest.requester.toString() 
        ? swapRequest.recipient 
        : swapRequest.requester,
      targetSwap: swapRequest._id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Swap completed successfully',
      data: {
        swapRequest
      }
    });
  } catch (error) {
    console.error('Complete swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing swap request'
    });
  }
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  getSwapRequestById,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  completeSwapRequest
}; 