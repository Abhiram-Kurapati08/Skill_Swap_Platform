const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedSkill: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    }
  },
  offeredSkill: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  scheduledDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  isRated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
swapRequestSchema.index({ requester: 1, status: 1 });
swapRequestSchema.index({ recipient: 1, status: 1 });
swapRequestSchema.index({ status: 1 });
swapRequestSchema.index({ createdAt: -1 });

// Virtual for checking if request is active
swapRequestSchema.virtual('isActive').get(function() {
  return ['pending', 'accepted'].includes(this.status);
});

// Method to check if user can cancel request
swapRequestSchema.methods.canCancel = function(userId) {
  return this.requester.toString() === userId.toString() && this.status === 'pending';
};

// Method to check if user can accept/reject request
swapRequestSchema.methods.canRespond = function(userId) {
  return this.recipient.toString() === userId.toString() && this.status === 'pending';
};

// Static method to get requests for a user
swapRequestSchema.statics.getUserRequests = function(userId, type = 'all') {
  const query = {};
  
  if (type === 'incoming') {
    query.recipient = userId;
  } else if (type === 'outgoing') {
    query.requester = userId;
  } else {
    query.$or = [{ requester: userId }, { recipient: userId }];
  }
  
  return this.find(query)
    .populate('requester', 'name profilePhotoUrl')
    .populate('recipient', 'name profilePhotoUrl')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('SwapRequest', swapRequestSchema); 