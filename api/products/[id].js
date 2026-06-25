const { ObjectId } = require('mongodb');
const clientPromise = require('../lib/mongodb');
const { requireAuth } = require('../lib/auth');

// Helper function to slugify product name (matches frontend)
const slugifyProductName = (name) => {
  if (!name) return '';
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF\-]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('danger-sneakers');
  
  // Extract product ID/slug from URL params
  let productId = req.params.id || '';
  
  // Debug logging
  console.log('🔍 Request URL:', req.url);
  console.log('🔍 Request params:', req.params);
  console.log('🔍 Product ID extracted:', productId);
  
  // Remove /soldout if present
  const isSoldOutEndpoint = req.url.includes('/soldout');

  const reservedSlugs = ['requests-recommended', 'promo'];
  if (reservedSlugs.includes(productId)) {
    return require('../products')(req, res);
  }

  console.log('🔍 Product ID endpoint called:', req.method, productId);

  try {
    // GET /api/products/[id] - Get single product
    if (req.method === 'GET' && !isSoldOutEndpoint) {
      let product;
      
      // First try ObjectId (for backward compatibility with admin dashboard)
      try {
        product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      } catch (error) {
        // Not a valid ObjectId, continue to slug lookup
      }
      
      // If not found by ObjectId, try slug lookup
      if (!product) {
        product = await db.collection('products').findOne({ slug: productId });
      }
      
      // If still not found, try matching by slugified name (for products without slug field)
      if (!product) {
        const allProducts = await db.collection('products').find({}).toArray();
        product = allProducts.find(p => slugifyProductName(p.name) === productId);
      }
      
      // If still not found, try case-insensitive name match
      if (!product) {
        const allProducts = await db.collection('products').find({}).toArray();
        product = allProducts.find(p => 
          p.name && p.name.toLowerCase().replace(/\s+/g, '-') === productId.toLowerCase()
        );
      }
      
      if (!product) {
        console.log('❌ Product not found:', productId);
        return res.status(404).json({ message: 'Product not found' });
      }
      
      console.log('✅ Product found:', product.name);
      return res.status(200).json(product);
    }

    // PUT /api/products/[id] - Update product
    if (req.method === 'PUT' && !isSoldOutEndpoint) {
      return requireAuth(req, res, async () => {
        console.log('📝 Updating product in [id].js:', productId);
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

        console.log('✅ Product updated successfully in [id].js');
        return res.status(200).json({ message: 'Product updated successfully' });
      });
    }

    // DELETE /api/products/[id] - Delete product
    if (req.method === 'DELETE') {
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

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Product [id] API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};