const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// User Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's user token
    if (decoded.userId) {
      req.userId = decoded.userId;
      req.user = await User.findById(decoded.userId).select('-password');
      req.userType = 'user';
    } 
    // Check if it's admin token
    else if (decoded.adminId) {
      req.adminId = decoded.adminId;
      req.admin = await Admin.findById(decoded.adminId).select('-password');
      req.userType = 'admin';
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Admin Only Middleware
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.adminId = decoded.adminId;
    req.admin = await Admin.findById(decoded.adminId).select('-password');
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// User Only Middleware
const userMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(403).json({
        success: false,
        message: 'User access required'
      });
    }

    req.userId = decoded.userId;
    req.user = await User.findById(decoded.userId).select('-password');
    
    next();
  } catch (error) {
    console.error('User middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

module.exports = { authMiddleware, adminMiddleware, userMiddleware };