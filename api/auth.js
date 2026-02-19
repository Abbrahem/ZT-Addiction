const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clientPromise = require('./lib/mongodb');

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
    const path = req.url.split('?')[0].toLowerCase();
    const method = req.method;

    console.log('🔐 Auth handler:', method, path);
    console.log('🔐 Request body:', req.body);
    console.log('🔐 Request headers:', req.headers);

    // Handle different methods on main auth route
    const isMainAuthRoute = path === '/api/auth';
    const isLoginRoute = (path.includes('/login') || isMainAuthRoute) && method === 'POST';
    const isLogoutRoute = (path.includes('/logout') || isMainAuthRoute) && method === 'DELETE';
    const isCheckRoute = (path.includes('/check') || isMainAuthRoute) && method === 'GET';
    
    console.log('🔐 Route checks - Login:', isLoginRoute, 'Logout:', isLogoutRoute, 'Check:', isCheckRoute);

    // LOGIN - POST /api/auth or /api/auth/login
    if (method === 'POST' && isLoginRoute) {
      console.log('🔐 Processing login request');

      const { email, password } = req.body;
      console.log('🔐 Login attempt - Email:', email, 'Password provided:', !!password);

      if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Seed admin if no users exist
      const adminCount = await db.collection('admins').countDocuments();
      if (adminCount === 0) {
        console.log('🔐 Creating admin user...');
        const adminEmail = process.env.ADMIN_EMAIL || 'zt@gmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'zt123456';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const adminUser = {
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          createdAt: new Date()
        };
        
        await db.collection('admins').insertOne(adminUser);
        await db.collection('users').insertOne({ ...adminUser });
        console.log('✅ Admin user created:', adminEmail);
      }

      // Check both users and admins collections
      console.log('🔍 Searching for user:', email);
      let user = await db.collection('users').findOne({ email });
      console.log('🔍 User in users collection:', !!user);
      if (!user) {
        user = await db.collection('admins').findOne({ email });
        console.log('🔍 User in admins collection:', !!user);
      }
      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
      }
      console.log('✅ User found:', user.email, 'Role:', user.role);

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role || 'admin' },
        process.env.JWT_SECRET || 'your-secret-key-here',
        { expiresIn: '7d' }
      );

      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);
      console.log('✅ Login successful for:', email);
      return res.status(200).json({
        message: 'تم تسجيل الدخول بنجاح',
        user: { email: user.email, role: user.role }
      });
    }

    // LOGOUT - DELETE /api/auth
    else if (method === 'DELETE' && isLogoutRoute) {
      console.log('🔐 Processing logout request');
      res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
      return res.status(200).json({ message: 'Logout successful' });
    }

    // CHECK - GET /api/auth
    else if (method === 'GET' && isCheckRoute) {
      console.log('🔐 Processing auth check request');
      console.log('🔐 Cookies:', req.cookies);
      return requireAuth(req, res, () => {
        console.log('✅ Auth check successful for user:', req.user.email);
        return res.status(200).json({
          message: 'Authenticated',
          user: req.user
        });
      });
    }

    // Unknown endpoint
    else {
      console.log('❌ Unknown auth endpoint:', method, path);
      console.log('❌ Available routes should match: POST /api/auth, POST /api/auth/logout, GET /api/auth/check');
      return res.status(404).json({ message: 'Auth endpoint not found' });
    }

  } catch (error) {
    console.error('❌ Auth handler error:', error);
    return res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message });
  }
};
