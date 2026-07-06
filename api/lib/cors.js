/**
 * CORS helper for Vercel API functions
 * يسمح للـ Capacitor app والويب يتواصل مع الـ API
 */

const allowedOrigins = [
  'https://zt-addiction.vercel.app',
  'https://www.zt-addiction.com',
  'https://zt-addiction.com',
  'capacitor://localhost',      // Android Capacitor
  'https://localhost',          // iOS Capacitor
  'http://localhost',           // Dev
  'http://localhost:3000',      // React dev server
  'http://localhost:3002',      // Express dev server
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  
  // Check if origin is allowed (or if it's a Vercel preview)
  const isAllowed = allowedOrigins.includes(origin) || 
                    /\.vercel\.app$/.test(origin) ||
                    !origin; // allow no-origin requests (mobile native)

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://zt-addiction.vercel.app');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function handleCors(req, res) {
  setCorsHeaders(req, res);
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // means "handled"
  }
  
  return false; // means "continue"
}

module.exports = { setCorsHeaders, handleCors };
