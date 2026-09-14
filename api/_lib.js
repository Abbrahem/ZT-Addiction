// ============================================
// Shared utilities for all API endpoints
// ============================================

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================
// CORS Handler
// ============================================

const allowedOrigins = [
  'https://zt-addiction.vercel.app',
  'https://www.zt-addiction.com',
  'https://zt-addiction.com',
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
  'http://localhost:3000',
  'http://localhost:3002',
];

function handleCors(req, res) {
  const origin = req.headers.origin || '';
  const isAllowed = allowedOrigins.includes(origin) || 
                    /\.vercel\.app$/.test(origin) ||
                    !origin;

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://zt-addiction.vercel.app');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

// ============================================
// MongoDB Connection
// ============================================

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  w: 'majority',
  retryReads: true
};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env file');
}

if (process.env.NODE_ENV === 'production') {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
} else {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

clientPromise
  .then(() => console.log('✅ MongoDB connected'))
  .catch((error) => console.error('❌ MongoDB error:', error.message));

// ============================================
// Auth Helpers
// ============================================

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    if (typeof next === 'function') {
      const result = next();
      if (result && typeof result.then === 'function') {
        return await result;
      }
      return result;
    }
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// ============================================
// Exports
// ============================================

module.exports = {
  handleCors,
  clientPromise,
  requireAuth,
  bcrypt,
  jwt
};
