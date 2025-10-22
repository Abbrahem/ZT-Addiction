const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.cookies.token;
    
    if (!token) {
      console.log('❌ No token found in cookies');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
    
    console.log('✅ Auth check passed for:', decoded.email);
    
    res.status(200).json({ 
      message: 'Authenticated',
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    console.log('❌ Auth check failed:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
