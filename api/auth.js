const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

// ── MongoDB ──────────────────────────────────────────────
const uri = process.env.MONGODB_URI;
const options = { serverSelectionTimeoutMS: 30000, socketTimeoutMS: 45000, connectTimeoutMS: 30000, retryWrites: true, w: 'majority' };

let _client;
let _clientPromise;
if (process.env.NODE_ENV === 'production') {
  _client = new MongoClient(uri, options);
  _clientPromise = _client.connect();
} else {
  if (!global._mongoAuthPromise) {
    _client = new MongoClient(uri, options);
    global._mongoAuthPromise = _client.connect();
  }
  _clientPromise = global._mongoAuthPromise;
}

// ── CORS ─────────────────────────────────────────────────
function handleCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://www.zt-addiction.com','https://zt-addiction.com','https://zt-addiction.vercel.app','http://localhost:3000','http://localhost:3002','capacitor://localhost','https://localhost'];
  if (allowed.includes(origin) || /\.vercel\.app$/.test(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.zt-addiction.com');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}

// ── Auth Middleware ───────────────────────────────────────
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const result = next();
    if (result && typeof result.then === 'function') return await result;
    return result;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ── Handler ───────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const client = await _clientPromise;
    const db = client.db('danger-sneakers');

    const path = (req.url || '').split('?')[0].toLowerCase();
    const method = req.method;

    console.log('🔐 Auth handler:', method, path, '| body:', req.body);

    // LOGIN
    if (method === 'POST') {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

      // Seed admin if empty
      const adminCount = await db.collection('admins').countDocuments();
      if (adminCount === 0) {
        const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'zt123456', 10);
        await db.collection('admins').insertOne({ email: process.env.ADMIN_EMAIL || 'zt@gmail.com', password: hashed, role: 'admin', createdAt: new Date() });
      }

      let user = await db.collection('users').findOne({ email });
      if (!user) user = await db.collection('admins').findOne({ email });
      if (!user) return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role || 'admin' },
        process.env.JWT_SECRET || 'danger-secret',
        { expiresIn: '7d' }
      );

      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);
      return res.status(200).json({ message: 'تم تسجيل الدخول بنجاح', user: { email: user.email, role: user.role } });
    }

    // LOGOUT
    if (method === 'DELETE') {
      res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
      return res.status(200).json({ message: 'Logout successful' });
    }

    // CHECK
    if (method === 'GET') {
      return requireAuth(req, res, () => res.status(200).json({ message: 'Authenticated', user: req.user }));
    }

    return res.status(404).json({ message: 'Not found' });

  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
