const { ObjectId } = require('mongodb');
const clientPromise = require('../lib/mongodb');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('danger-sneakers');
  
  // Extract product ID from URL
  const urlParts = req.url.split('/');
  let productId = urlParts[urlParts.length - 1].split('?')[0];
  
  // Remove /soldout if present
  const isSoldOutEndpoint = req.url.includes('/soldout');
  if (isSoldOutEndpoint) {
    productId = urlParts[urlParts.length - 2];
  }

  console.log('🔍 Product ID endpoint called:', req.method, productId);

  try {
    // GET /api/products/[id] - Get single product
    if (req.method === 'GET' && !isSoldOutEndpoint) {
      let product;
      
      try {
        product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      } catch (error) {
        product = await db.collection('products').findOne({ _id: productId });
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