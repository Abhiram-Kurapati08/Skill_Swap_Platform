const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Account is banned. Please contact support.',
        banReason: user.banReason 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Middleware to log activity
const logActivity = async (action, details = {}) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      res.send = originalSend;
      
      // Log activity after response is sent
      if (res.statusCode < 400) { // Only log successful requests
        ActivityLog.logActivity({
          user: req.user._id,
          action,
          details: {
            ...details,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        });
      }
      
      return originalSend.call(this, data);
    };
    next();
  };
};

module.exports = {
  auth,
  requireAdmin,
  logActivity
}; 