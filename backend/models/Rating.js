const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  skillRated: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ratingSchema.index({ rater: 1, ratedUser: 1 });
ratingSchema.index({ ratedUser: 1 });
ratingSchema.index({ swapRequest: 1 });
ratingSchema.index({ createdAt: -1 });

// Ensure one rating per swap request per user
ratingSchema.index({ swapRequest: 1, rater: 1 }, { unique: true });

// Static method to get average rating for a user
ratingSchema.statics.getAverageRating = async function(userId) {
  const result = await this.aggregate([
    { $match: { ratedUser: userId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalRatings: result[0].totalRatings
  } : { averageRating: 0, totalRatings: 0 };
};

// Static method to get ratings for a user
ratingSchema.statics.getUserRatings = function(userId, limit = 10) {
  return this.find({ ratedUser: userId })
    .populate('rater', 'name profilePhotoUrl')
    .populate('swapRequest', 'requestedSkill offeredSkill')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Method to check if user can rate
ratingSchema.statics.canRate = async function(swapRequestId, userId) {
  const swapRequest = await mongoose.model('SwapRequest').findById(swapRequestId);
  if (!swapRequest || swapRequest.status !== 'completed') {
    return false;
  }
  
  const existingRating = await this.findOne({ swapRequest: swapRequestId, rater: userId });
  return !existingRating;
};

module.exports = mongoose.model('Rating', ratingSchema); 