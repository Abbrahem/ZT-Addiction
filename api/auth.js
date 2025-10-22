const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clientPromise = require('./lib/mongodb');
const { seedAdmin } = require('./lib/seedAdmin');

// Authentication middleware
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Handle different auth endpoints based on URL path and method
    const path = req.url.split('?')[0];
    const method = req.method;
    
    console.log('🔐 Auth handler:', method, path);
    
    // POST /api/auth or /api/auth/login = Login
    if (method === 'POST' && (path === '/api/auth' || path.endsWith('/login') || path.includes('/login') || path === '/api/auth/login')) {

      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
        }

        // Seed admin if no users exist
        try {
          await seedAdmin();
        } catch (seedError) {
          console.error('Seed admin error:', seedError);
          // Continue even if seeding fails
        }

        // Check both users and admins collections
        let user = await db.collection('users').findOne({ email });
        if (!user) {
          user = await db.collection('admins').findOne({ email });
        }
        if (!user) {
          return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role || 'admin' },
          process.env.JWT_SECRET || 'your-secret-key-here',
          { expiresIn: '7d' }
        );

        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);
        res.status(200).json({ 
          message: 'تم تسجيل الدخول بنجاح',
          user: { email: user.email, role: user.role }
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message });
      }
    }
  
  else if (path.endsWith('/logout') || path.includes('/auth/logout') || path === '/api/auth/logout') {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
    res.status(200).json({ message: 'Logout successful' });
  }
  
  else if (path.endsWith('/check') || path.includes('/auth/check') || path === '/api/auth/check') {
    return requireAuth(req, res, () => {
      res.status(200).json({ 
        message: 'Authenticated',
        user: req.user
      });
    });
  }
  
  else {
    res.status(404).json({ message: 'Auth endpoint not found' });
  }
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message });
  }
};
