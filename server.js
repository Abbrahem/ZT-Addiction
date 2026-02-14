const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
} else {
  // In development, serve static files from public folder
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/static', express.static(path.join(__dirname, 'public')));

  // Handle %PUBLIC_URL% requests in development
  app.use((req, res, next) => {
    if (req.url.includes('%PUBLIC_URL%')) {
      try {
        const newUrl = req.url.replace(/%PUBLIC_URL%/g, '');
        return res.redirect(301, newUrl);
      } catch (error) {
        console.log('URL decode error for:', req.url);
        return res.status(404).send('File not found');
      }
    }
    next();
  });
}

// API Routes - dynamically load all API files
const apiPath = path.join(__dirname, 'api');

// Function to recursively load API routes
function loadApiRoutes(dir, basePath = '/api') {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively load subdirectories
      loadApiRoutes(filePath, `${basePath}/${file}`);
    } else if (file.endsWith('.js') && !file.includes('lib')) {
      try {
        const route = require(filePath);
        const routeName = file === 'index.js' ? '' : `/${file.replace('.js', '')}`;
        const fullPath = `${basePath}${routeName}`;

        // Handle dynamic routes like [id].js and nested routes like [id]/soldout.js
        const dynamicPath = fullPath.replace(/\[([^\]]+)\]/g, ':$1');

        // Check if route is a function (middleware) or has default export
        if (typeof route === 'function') {
          app.all(dynamicPath, route);
          console.log(`✅ Loaded API route: ${dynamicPath} (ALL methods)`);
          
          // Special handling for orders - add dynamic ID route and promo routes
          if (file === 'orders.js') {
            app.all(`${basePath}/orders/:id`, route);
            app.all(`${basePath}/orders/promo`, route);
            console.log(`✅ Loaded API route: ${basePath}/orders/:id (ALL methods)`);
            console.log(`✅ Loaded API route: ${basePath}/orders/promo (ALL methods)`);
          }
          
          // Special handling for products - add dynamic ID routes
          if (file === 'products.js') {
            app.all(`${basePath}/products/:id`, route);
            app.all(`${basePath}/products/:id/soldout`, route);
            app.all(`${basePath}/products/:id/bestseller`, route);
            app.all(`${basePath}/products/:id/review`, route);
            app.all(`${basePath}/products/:id/reviews`, route);
            console.log(`✅ Loaded API route: ${basePath}/products/:id (ALL methods)`);
            console.log(`✅ Loaded API route: ${basePath}/products/:id/soldout (ALL methods)`);
            console.log(`✅ Loaded API route: ${basePath}/products/:id/bestseller (ALL methods)`);
            console.log(`✅ Loaded API route: ${basePath}/products/:id/review (ALL methods)`);
            console.log(`✅ Loaded API route: ${basePath}/products/:id/reviews (ALL methods)`);
          }
          
          // Special handling for auth - add auth sub-routes
          if (file === 'auth.js') {
            // Main auth route
            app.all(`${basePath}/auth`, route);
            // Sub-routes
            app.all(`${basePath}/auth/login`, route);
            app.all(`${basePath}/auth/logout`, route);
            app.all(`${basePath}/auth/check`, route);
            console.log(`✅ Loaded API route: ${basePath}/auth (ALL methods)`);
            console.log(`✅ Loaded API route: ${basePath}/auth/login (ALL methods)`);
            console.log(`✅ Loaded API route: ${basePath}/auth/logout (ALL methods)`);
            console.log(`✅ Loaded API route: ${basePath}/auth/check (ALL methods)`);
          }
        } else if (route.default && typeof route.default === 'function') {
          app.all(dynamicPath, route.default);
          console.log(`✅ Loaded API route: ${dynamicPath} (ALL methods)`);
        } else if (typeof route === 'object' && route.handler && typeof route.handler === 'function') {
          app.all(dynamicPath, route.handler);
          console.log(`✅ Loaded API route: ${dynamicPath} (ALL methods)`);
        } else {
          console.log(`⚠️ Skipped ${filePath}: Not a valid middleware function`);
        }
      } catch (error) {
        console.error(`❌ Error loading ${filePath}:`, error.message);
      }
    }
  });
}

// Add a test route
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.json({ message: 'ZT ADDICTION API Server', status: 'running' });
  } else {
    // In development, serve a helpful page
    res.sendFile(path.join(__dirname, 'public', 'dev-index.html'));
  }
});

// Load all API routes
loadApiRoutes(apiPath);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle URL decode errors
  if (err.message && err.message.includes('Failed to decode param')) {
    console.log('URL decode error for:', req.url);
    return res.status(400).send('Invalid URL');
  }

  console.error('Server error:', err);

  // Don't crash the server on errors
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log the error
});

// 404 handler - only for API routes
app.use('/api', (req, res) => {
  console.log(`404 - API route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'API route not found' });
});

// 404 handler for other routes (but not static files)
app.use((req, res) => {
  // Don't log static file 404s
  if (!req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
  }
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend: http://localhost:${PORT}`);
});

module.exports = app;
