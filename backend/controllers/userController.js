const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users (public profiles only)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      location, 
      skill, 
      availability,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isProfilePublic: true, isBanned: false };
    
    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Filter by availability
    if (availability) {
      query.availability = availability;
    }
    
    // Filter by skill (either offered or wanted)
    if (skill) {
      query.$or = [
        { 'skillsOffered.name': { $regex: skill, $options: 'i' } },
        { 'skillsWanted.name': { $regex: skill, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('name location availability skillsOffered skillsWanted profilePhotoUrl averageRating totalRatings completedSwaps')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is public or if requesting user is the owner
    if (!user.isProfilePublic && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Profile is private'
      });
    }

    const userData = user.isProfilePublic ? user.getPublicProfile() : user;

    res.json({
      success: true,
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, location, availability, isProfilePublic, profilePhotoUrl } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (availability) updateData.availability = availability;
    if (typeof isProfilePublic === 'boolean') updateData.isProfilePublic = isProfilePublic;
    if (profilePhotoUrl) updateData.profilePhotoUrl = profilePhotoUrl;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'profile_update',
      details: { updatedFields: Object.keys(updateData) },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Add skill to offered skills
// @route   POST /api/users/skills/offered
// @access  Private
const addOfferedSkill = async (req, res) => {
  try {
    const { name, description, level } = req.body;

    const user = await User.findById(req.user._id);
    
    // Check if skill already exists
    const existingSkill = user.skillsOffered.find(
      skill => skill.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists in your offered skills'
      });
    }

    user.skillsOffered.push({ name, description, level });
    await user.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'profile_update',
      details: { action: 'add_offered_skill', skillName: name },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Skill added to offered skills successfully',
      data: {
        skillsOffered: user.skillsOffered
      }
    });
  } catch (error) {
    console.error('Add offered skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding skill'
    });
  }
};

// @desc    Add skill to wanted skills
// @route   POST /api/users/skills/wanted
// @access  Private
const addWantedSkill = async (req, res) => {
  try {
    const { name, description, level } = req.body;

    const user = await User.findById(req.user._id);
    
    // Check if skill already exists
    const existingSkill = user.skillsWanted.find(
      skill => skill.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists in your wanted skills'
      });
    }

    user.skillsWanted.push({ name, description, level });
    await user.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'profile_update',
      details: { action: 'add_wanted_skill', skillName: name },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Skill added to wanted skills successfully',
      data: {
        skillsWanted: user.skillsWanted
      }
    });
  } catch (error) {
    console.error('Add wanted skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding skill'
    });
  }
};

// @desc    Remove skill from offered skills
// @route   DELETE /api/users/skills/offered/:skillId
// @access  Private
const removeOfferedSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const skillIndex = user.skillsOffered.findIndex(
      skill => skill._id.toString() === req.params.skillId
    );
    
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    const removedSkill = user.skillsOffered.splice(skillIndex, 1)[0];
    await user.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'profile_update',
      details: { action: 'remove_offered_skill', skillName: removedSkill.name },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Skill removed from offered skills successfully',
      data: {
        skillsOffered: user.skillsOffered
      }
    });
  } catch (error) {
    console.error('Remove offered skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing skill'
    });
  }
};

// @desc    Remove skill from wanted skills
// @route   DELETE /api/users/skills/wanted/:skillId
// @access  Private
const removeWantedSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const skillIndex = user.skillsWanted.findIndex(
      skill => skill._id.toString() === req.params.skillId
    );
    
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    const removedSkill = user.skillsWanted.splice(skillIndex, 1)[0];
    await user.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'profile_update',
      details: { action: 'remove_wanted_skill', skillName: removedSkill.name },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Skill removed from wanted skills successfully',
      data: {
        skillsWanted: user.skillsWanted
      }
    });
  } catch (error) {
    console.error('Remove wanted skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing skill'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const stats = {
      totalSkillsOffered: user.skillsOffered.length,
      totalSkillsWanted: user.skillsWanted.length,
      averageRating: user.averageRating,
      totalRatings: user.totalRatings,
      completedSwaps: user.completedSwaps,
      memberSince: user.createdAt
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  addOfferedSkill,
  addWantedSkill,
  removeOfferedSkill,
  removeWantedSkill,
  getUserStats
}; 