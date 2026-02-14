const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      console.log('❌ No token found in cookies');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('✅ Token verified for user:', decoded.userId);
    
    // If next is an async function (callback pattern), execute it
    if (typeof next === 'function') {
      // Check if it's an async function by checking if it returns a promise
      const result = next();
      if (result && typeof result.then === 'function') {
        return await result;
      }
      return result;
    }
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticateToken,
  requireAuth: authenticateToken
};
