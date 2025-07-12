const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const ActivityLog = require('../models/ActivityLog');
const { Parser } = require('json2csv');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      isBanned,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (typeof isBanned === 'boolean') {
      query.isBanned = isBanned;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
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
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Ban user
// @route   POST /api/admin/users/ban
// @access  Private/Admin
const banUser = async (req, res) => {
  try {
    const { userId, banReason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    user.isBanned = true;
    user.banReason = banReason;
    await user.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'user_banned',
      details: { 
        bannedUserId: userId,
        banReason 
      },
      targetUser: userId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User banned successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBanned: user.isBanned,
          banReason: user.banReason
        }
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error banning user'
    });
  }
};

// @desc    Unban user
// @route   POST /api/admin/users/unban
// @access  Private/Admin
const unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBanned = false;
    user.banReason = null;
    await user.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'user_unbanned',
      details: { 
        unbannedUserId: userId
      },
      targetUser: userId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User unbanned successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBanned: user.isBanned
        }
      }
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unbanning user'
    });
  }
};

// @desc    Get all swap requests (admin only)
// @route   GET /api/admin/swaps
// @access  Private/Admin
const getAllSwapRequests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .sort(sortOptions)
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
    console.error('Get all swap requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap requests'
    });
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBanned: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Swap request statistics
    const totalSwapRequests = await SwapRequest.countDocuments();
    const pendingSwapRequests = await SwapRequest.countDocuments({ status: 'pending' });
    const completedSwapRequests = await SwapRequest.countDocuments({ status: 'completed' });
    const swapRequestsThisMonth = await SwapRequest.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Activity statistics
    const activityStats = await ActivityLog.getActivityStats();

    // Recent activity
    const recentActivity = await ActivityLog.getAdminActivity({}, 10);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          newThisMonth: newUsersThisMonth
        },
        swaps: {
          total: totalSwapRequests,
          pending: pendingSwapRequests,
          completed: completedSwapRequests,
          thisMonth: swapRequestsThisMonth
        },
        activity: {
          stats: activityStats,
          recent: recentActivity
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action, 
      userId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    
    if (action) {
      filters.action = action;
    }
    
    if (userId) {
      filters.userId = userId;
    }
    
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const logs = await ActivityLog.getAdminActivity(filters, limit)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(filters);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalLogs: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs'
    });
  }
};

// @desc    Export activity logs to CSV
// @route   GET /api/admin/export-logs
// @access  Private/Admin
const exportActivityLogs = async (req, res) => {
  try {
    const { action, userId, startDate, endDate } = req.query;

    const filters = {};
    
    if (action) {
      filters.action = action;
    }
    
    if (userId) {
      filters.userId = userId;
    }
    
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    const logs = await ActivityLog.getAdminActivity(filters, 10000); // Export up to 10k records

    // Transform data for CSV
    const csvData = logs.map(log => ({
      Date: log.createdAt.toISOString(),
      User: log.user?.name || 'Unknown',
      Email: log.user?.email || 'Unknown',
      Action: log.action,
      Details: JSON.stringify(log.details),
      IP_Address: log.ipAddress || 'Unknown',
      User_Agent: log.userAgent || 'Unknown'
    }));

    const fields = ['Date', 'User', 'Email', 'Action', 'Details', 'IP_Address', 'User_Agent'];
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting activity logs'
    });
  }
};

// @desc    Moderate skill description
// @route   PUT /api/admin/moderate-skill
// @access  Private/Admin
const moderateSkill = async (req, res) => {
  try {
    const { userId, skillType, skillId, action, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let skillArray, skillIndex;
    
    if (skillType === 'offered') {
      skillArray = user.skillsOffered;
    } else if (skillType === 'wanted') {
      skillArray = user.skillsWanted;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill type'
      });
    }

    skillIndex = skillArray.findIndex(skill => skill._id.toString() === skillId);
    
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    if (action === 'remove') {
      const removedSkill = skillArray.splice(skillIndex, 1)[0];
      await user.save();

      // Log activity
      await ActivityLog.logActivity({
        user: req.user._id,
        action: 'admin_action',
        details: { 
          action: 'skill_removed',
          userId,
          skillType,
          skillName: removedSkill.name,
          reason
        },
        targetUser: userId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Skill removed successfully',
        data: {
          skill: removedSkill
        }
      });
    } else if (action === 'update') {
      const { name, description, level } = req.body;
      
      skillArray[skillIndex] = {
        ...skillArray[skillIndex],
        name: name || skillArray[skillIndex].name,
        description: description || skillArray[skillIndex].description,
        level: level || skillArray[skillIndex].level
      };
      
      await user.save();

      // Log activity
      await ActivityLog.logActivity({
        user: req.user._id,
        action: 'admin_action',
        details: { 
          action: 'skill_updated',
          userId,
          skillType,
          skillName: skillArray[skillIndex].name,
          reason
        },
        targetUser: userId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Skill updated successfully',
        data: {
          skill: skillArray[skillIndex]
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }
  } catch (error) {
    console.error('Moderate skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating skill'
    });
  }
};

module.exports = {
  getAllUsers,
  banUser,
  unbanUser,
  getAllSwapRequests,
  getDashboardStats,
  getActivityLogs,
  exportActivityLogs,
  moderateSkill
}; 