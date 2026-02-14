const { ObjectId } = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { requireAuth } = require('./lib/auth');

// Firebase Admin SDK for sending notifications
let admin;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    admin = require('firebase-admin');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  }
} catch (error) {
  console.log('⚠️ Firebase Admin not initialized in products.js');
}

// Helper function to send notification to all users
async function sendNotificationToAll(title, body, data = {}) {
  if (!admin) return;
  
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Get all user tokens
    const tokens = await db.collection('fcmTokens').find({ userType: 'user' }).toArray();
    
    if (tokens.length === 0) {
      console.log('⚠️ No user tokens found');
      return;
    }
    
    const tokenList = tokens.map(t => t.token);
    
    const message = {
      notification: { title, body },
      data,
      tokens: tokenList
    };
    
    const response = await admin.messaging().sendMulticast(message);
    console.log(`✅ Sent to ${response.successCount} users`);
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
  }
}

module.exports = async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('danger-sneakers');

  // Extract product ID from URL if present
  const urlParts = req.url.split('/');
  const productId = req.params?.id || (urlParts.length > 3 ? urlParts[3].split('?')[0] : null);
  const isSoldOutEndpoint = req.url.includes('/soldout');

  console.log('🔍 Products API called:', req.method, req.url, 'ProductID:', productId);

  try {
    // GET /api/products - Get all products
    if (req.method === 'GET' && !productId) {
      const limit = req.query?.limit ? parseInt(req.query.limit) : undefined;
      const random = req.query?.random === 'true';
      const excludeId = req.query?.exclude;

      let products = await db.collection('products').find({}).toArray();

      // Exclude specific product if requested
      if (excludeId) {
        products = products.filter(p => p._id.toString() !== excludeId && p._id !== excludeId);
      }

      // Shuffle products if random is requested
      if (random) {
        products = products.sort(() => Math.random() - 0.5);
      }

      if (limit) {
        products = products.slice(0, limit);
      }

      return res.status(200).json(products);
    }

    // GET /api/products/[id] - Get single product
    if (req.method === 'GET' && productId && !isSoldOutEndpoint) {
      let product;

      try {
        product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      } catch (error) {
        product = await db.collection('products').findOne({ _id: productId });
      }

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json(product);
    }

    // POST /api/products - Create new product
    if (req.method === 'POST' && !productId) {
      return requireAuth(req, res, async () => {
        const { name, description, collection, images, sizesWithPrices, priceEGP, size, bundlePerfume1, bundlePerfume2, bundlePerfume3, bundlePerfume4 } = req.body;
        
        console.log('📦 Creating product with data:', { name, collection, sizesWithPrices, priceEGP, size, bundlePerfume1, bundlePerfume2, bundlePerfume3, bundlePerfume4 });

        if (!name || !collection) {
          console.log('❌ Missing name or collection');
          return res.status(400).json({ message: 'Name and collection are required' });
        }

        // Check if it's a bundle
        const isBundle = collection === 'Bundles';
        
        // For bundles, validate bundle data
        if (isBundle) {
          if (!bundlePerfume1 || !bundlePerfume2) {
            return res.status(400).json({ message: 'Bundle products require at least 2 perfumes' });
          }
          if (!bundlePerfume1.sizesWithPrices || bundlePerfume1.sizesWithPrices.length === 0) {
            return res.status(400).json({ message: 'Perfume 1 requires sizes with prices' });
          }
          if (!bundlePerfume2.sizesWithPrices || bundlePerfume2.sizesWithPrices.length === 0) {
            return res.status(400).json({ message: 'Perfume 2 requires sizes with prices' });
          }
        } else {
          // Check if we have either sizesWithPrices or legacy format
          const hasSizesWithPrices = sizesWithPrices && Array.isArray(sizesWithPrices) && sizesWithPrices.length > 0;
          const hasLegacyFormat = priceEGP && size;
          
          console.log('📦 Validation check:', { hasSizesWithPrices, hasLegacyFormat, sizesWithPricesLength: sizesWithPrices?.length });
          
          if (!hasSizesWithPrices && !hasLegacyFormat) {
            console.log('❌ Missing sizes/prices data');
            return res.status(400).json({ message: 'Either sizesWithPrices array or price/size are required' });
          }
        }

        const product = {
          name,
          description: description || '',
          collection,
          images: images || [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Handle bundle products
        if (isBundle) {
          // Initialize soldOut property for all sizes - Perfume 1
          const perfume1WithSoldOut = {
            ...bundlePerfume1,
            sizesWithPrices: bundlePerfume1.sizesWithPrices.map(item => ({
              ...item,
              soldOut: item.soldOut || false
            }))
          };
          
          // Perfume 2
          const perfume2WithSoldOut = {
            ...bundlePerfume2,
            sizesWithPrices: bundlePerfume2.sizesWithPrices.map(item => ({
              ...item,
              soldOut: item.soldOut || false
            }))
          };
          
          product.bundlePerfume1 = perfume1WithSoldOut;
          product.bundlePerfume2 = perfume2WithSoldOut;
          
          // Perfume 3 (Optional)
          if (bundlePerfume3?.name && bundlePerfume3?.sizesWithPrices?.length > 0) {
            product.bundlePerfume3 = {
              ...bundlePerfume3,
              sizesWithPrices: bundlePerfume3.sizesWithPrices.map(item => ({
                ...item,
                soldOut: item.soldOut || false
              }))
            };
          }
          
          // Perfume 4 (Optional)
          if (bundlePerfume4?.name && bundlePerfume4?.sizesWithPrices?.length > 0) {
            product.bundlePerfume4 = {
              ...bundlePerfume4,
              sizesWithPrices: bundlePerfume4.sizesWithPrices.map(item => ({
                ...item,
                soldOut: item.soldOut || false
              }))
            };
          }
          
          // Calculate default price from first size of each perfume
          const price1 = bundlePerfume1.sizesWithPrices[0]?.price || 0;
          const price2 = bundlePerfume2.sizesWithPrices[0]?.price || 0;
          const price3 = bundlePerfume3?.sizesWithPrices?.[0]?.price || 0;
          const price4 = bundlePerfume4?.sizesWithPrices?.[0]?.price || 0;
          product.priceEGP = price1 + price2 + price3 + price4;
          
          product.isBundle = true;
        } else {
          // Add sizesWithPrices if provided, otherwise use legacy format
          const hasSizesWithPrices = sizesWithPrices && Array.isArray(sizesWithPrices) && sizesWithPrices.length > 0;
          if (hasSizesWithPrices) {
            product.sizesWithPrices = sizesWithPrices;
            // Set legacy fields for compatibility
            product.priceEGP = sizesWithPrices[0].price;
            product.size = sizesWithPrices[0].size;
            product.sizes = sizesWithPrices.map(item => item.size);
          } else {
            // Legacy format
            product.priceEGP = parseFloat(priceEGP);
            product.size = size;
            product.sizes = [size];
          }
        }

        const result = await db.collection('products').insertOne(product);
        
        // Send notification to all users about new product via notification service
        const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;
        const NOTIFICATION_API_KEY = process.env.NOTIFICATION_API_KEY;
        
        if (NOTIFICATION_SERVICE_URL) {
          fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/new-product`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': NOTIFICATION_API_KEY
            },
            body: JSON.stringify({
              productName: name,
              price: product.sizesWithPrices?.[0]?.price || product.priceEGP || 0,
              category: collection,
              productId: result.insertedId.toString()
            })
          }).catch(err => console.error('Notification failed:', err));
        }
        
        return res.status(201).json({
          message: 'Product created successfully',
          productId: result.insertedId
        });
      });
    }

    // PUT /api/products/[id] - Update product
    if (req.method === 'PUT' && productId && !isSoldOutEndpoint) {
      return requireAuth(req, res, async () => {
        console.log('📝 Updating product:', productId);
        console.log('📦 Update data:', req.body);
        console.log('🏷️ Subcategory:', req.body.subcategory);
        
        const updateData = {
          ...req.body, // Take all fields from request body
          updatedAt: new Date()
        };
        
        // Remove _id if it exists in the body
        delete updateData._id;

        let result;
        try {
          result = await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: updateData }
          );
        } catch (error) {
          result = await db.collection('products').updateOne(
            { _id: productId },
            { $set: updateData }
          );
        }

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        console.log('✅ Product updated successfully');
        return res.status(200).json({ message: 'Product updated successfully' });
      });
    }

    // PATCH /api/products/[id]/soldout - Toggle sold out status
    if (req.method === 'PATCH' && productId && isSoldOutEndpoint) {
      return requireAuth(req, res, async () => {
        const { soldOut } = req.body;

        if (typeof soldOut !== 'boolean') {
          return res.status(400).json({ message: 'soldOut must be a boolean value' });
        }

        let result;
        try {
          result = await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: { soldOut, updatedAt: new Date() } }
          );
        } catch (error) {
          result = await db.collection('products').updateOne(
            { _id: productId },
            { $set: { soldOut, updatedAt: new Date() } }
          );
        }

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({
          message: 'Product status updated successfully',
          soldOut
        });
      });
    }

    // PATCH /api/products/[id]/bestseller - Toggle best seller status
    const isBestSellerEndpoint = req.url.includes('/bestseller');
    if (req.method === 'PATCH' && productId && isBestSellerEndpoint) {
      return requireAuth(req, res, async () => {
        const { isBestSeller } = req.body;

        if (typeof isBestSeller !== 'boolean') {
          return res.status(400).json({ message: 'isBestSeller must be a boolean value' });
        }

        // If setting as best seller, check if we already have 6
        if (isBestSeller) {
          const bestSellerCount = await db.collection('products').countDocuments({ isBestSeller: true });
          if (bestSellerCount >= 6) {
            return res.status(400).json({ message: 'Maximum 6 best sellers allowed. Remove one first.' });
          }
        }

        let result;
        try {
          result = await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: { isBestSeller, updatedAt: new Date() } }
          );
        } catch (error) {
          result = await db.collection('products').updateOne(
            { _id: productId },
            { $set: { isBestSeller, updatedAt: new Date() } }
          );
        }

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({
          message: 'Best seller status updated successfully',
          isBestSeller
        });
      });
    }

    // DELETE /api/products/[id] - Delete product
    if (req.method === 'DELETE' && productId) {
      return requireAuth(req, res, async () => {
        let result;
        try {
          result = await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
        } catch (error) {
          result = await db.collection('products').deleteOne({ _id: productId });
        }

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product deleted successfully' });
      });
    }

    // POST /api/products/[id]/review - Add review
    if (req.method === 'POST' && productId && req.url.includes('/review')) {
      const { rating, comment, userName, userEmail } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ message: 'Comment is required' });
      }

      const review = {
        _id: new ObjectId(),
        rating: parseInt(rating),
        comment: comment.trim(),
        userName: userName || userEmail?.split('@')[0] || 'Anonymous',
        userEmail: userEmail || 'anonymous@example.com',
        createdAt: new Date()
      };

      let result;
      try {
        result = await db.collection('products').updateOne(
          { _id: new ObjectId(productId) },
          { 
            $push: { reviews: review },
            $inc: { reviewCount: 1 }
          }
        );
      } catch (error) {
        result = await db.collection('products').updateOne(
          { _id: productId },
          { 
            $push: { reviews: review },
            $inc: { reviewCount: 1 }
          }
        );
      }

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Calculate new average rating
      let product;
      try {
        product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      } catch (error) {
        product = await db.collection('products').findOne({ _id: productId });
      }

      if (product && product.reviews) {
        const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
        await db.collection('products').updateOne(
          { _id: product._id },
          { $set: { averageRating: Math.round(avgRating * 10) / 10 } }
        );
      }

      return res.status(201).json({ message: 'Review added successfully', review });
    }

    // GET /api/products/[id]/reviews - Get all reviews for a product
    if (req.method === 'GET' && productId && req.url.includes('/reviews')) {
      let product;
      try {
        product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      } catch (error) {
        product = await db.collection('products').findOne({ _id: productId });
      }

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const reviews = product.reviews || [];
      return res.status(200).json({ 
        reviews: reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        averageRating: product.averageRating || 0,
        reviewCount: reviews.length
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
