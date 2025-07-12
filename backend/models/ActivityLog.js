const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'register',
      'login',
      'logout',
      'profile_update',
      'swap_request_created',
      'swap_request_accepted',
      'swap_request_rejected',
      'swap_request_cancelled',
      'swap_completed',
      'rating_given',
      'user_banned',
      'user_unbanned',
      'admin_action'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetSwap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// Static method to log activity
activityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Static method to get user activity
activityLogSchema.statics.getUserActivity = function(userId, limit = 50) {
  return this.find({ user: userId })
    .populate('targetUser', 'name email')
    .populate('targetSwap', 'requestedSkill offeredSkill status')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get activity for admin dashboard
activityLogSchema.statics.getAdminActivity = function(filters = {}, limit = 100) {
  const query = {};
  
  if (filters.action) {
    query.action = filters.action;
  }
  
  if (filters.userId) {
    query.user = filters.userId;
  }
  
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return this.find(query)
    .populate('user', 'name email')
    .populate('targetUser', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get activity statistics
activityLogSchema.statics.getActivityStats = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('ActivityLog', activityLogSchema); 