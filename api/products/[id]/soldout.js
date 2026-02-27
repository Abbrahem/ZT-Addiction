const { ObjectId } = require('mongodb');
const clientPromise = require('../../lib/mongodb');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return requireAuth(req, res, async () => {
    try {
      const client = await clientPromise;
      const db = client.db('danger-sneakers');
      
      // Extract product ID from URL
      const urlParts = req.url.split('?')[0].split('/');
      const productId = urlParts[urlParts.length - 2];
      
      // Check action type from query or body
      const action = req.query?.action || req.body?.action || 'soldout';
      
      console.log('📝 Request details:', {
        action,
        query: req.query,
        body: req.body,
        productId
      });
      
      // Helper function to convert ID
      const getObjectId = (id) => {
        try {
          return new ObjectId(id);
        } catch {
          return id;
        }
      };
      
      // Handle bestseller action
      if (action === 'bestseller') {
        const isBestSeller = req.query.isBestSeller === 'true' || req.body.isBestSeller === true;

        // If setting as best seller, check if we already have 6
        if (isBestSeller) {
          const bestSellerCount = await db.collection('products').countDocuments({ isBestSeller: true });
          if (bestSellerCount >= 6) {
            return res.status(400).json({ message: 'Maximum 6 best sellers allowed. Remove one first.' });
          }
        }

        const result = await db.collection('products').updateOne(
          { _id: getObjectId(productId) },
          { $set: { isBestSeller, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ 
          success: true,
          message: 'Best seller status updated',
          isBestSeller 
        });
      }

      // Handle bestreview action
      if (action === 'bestreview') {
        const isBestReview = req.query.isBestReview === 'true' || req.body.isBestReview === true;

        // If setting as best review, check if we already have 4
        if (isBestReview) {
          const bestReviewCount = await db.collection('products').countDocuments({ isBestReview: true });
          if (bestReviewCount >= 4) {
            return res.status(400).json({ message: 'Maximum 4 best reviews allowed. Remove one first.' });
          }
        }

        const result = await db.collection('products').updateOne(
          { _id: getObjectId(productId) },
          { $set: { isBestReview, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ 
          success: true,
          message: 'Best review status updated',
          isBestReview 
        });
      }

      // Handle size soldout action
      if (action === 'sizeSoldout') {
        const size = req.query.size || req.body.size;
        const isSoldOut = req.query.isSoldOut === 'true' || req.body.isSoldOut === true;

        if (!size) {
          return res.status(400).json({ message: 'Size is required' });
        }

        // Get the product first
        const product = await db.collection('products').findOne({ _id: getObjectId(productId) });

        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }

        // Update sizesWithPrices array
        const sizesWithPrices = product.sizesWithPrices || [];
        const updatedSizes = sizesWithPrices.map(item => {
          if (item.size === size) {
            return { ...item, soldOut: isSoldOut };
          }
          return item;
        });

        const result = await db.collection('products').updateOne(
          { _id: getObjectId(productId) },
          { $set: { sizesWithPrices: updatedSizes, updatedAt: new Date() } }
        );

        return res.status(200).json({ 
          success: true,
          message: 'Size status updated',
          size,
          isSoldOut 
        });
      }

      // Handle bundle size soldout action
      if (action === 'bundleSizeSoldout') {
        const perfumeNumber = parseInt(req.query.perfumeNumber || req.body.perfumeNumber);
        const size = req.query.size || req.body.size;
        const isSoldOut = req.query.isSoldOut === 'true' || req.body.isSoldOut === true;

        if (!perfumeNumber || !size) {
          return res.status(400).json({ message: 'Perfume number and size are required' });
        }

        // Get the product first
        const product = await db.collection('products').findOne({ _id: getObjectId(productId) });

        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }

        // Update the correct perfume's sizes (supports 1, 2, 3, 4)
        const perfumeKeyMap = {
          1: 'bundlePerfume1',
          2: 'bundlePerfume2',
          3: 'bundlePerfume3',
          4: 'bundlePerfume4'
        };
        const perfumeKey = perfumeKeyMap[perfumeNumber];
        
        if (!perfumeKey) {
          return res.status(400).json({ message: 'Invalid perfume number. Must be 1, 2, 3, or 4' });
        }
        
        const perfume = product[perfumeKey];
        
        if (!perfume || !perfume.sizesWithPrices) {
          return res.status(404).json({ message: 'Perfume or sizes not found' });
        }

        const updatedSizes = perfume.sizesWithPrices.map(item => {
          if (item.size === size) {
            return { ...item, soldOut: isSoldOut };
          }
          return item;
        });

        const result = await db.collection('products').updateOne(
          { _id: getObjectId(productId) },
          { $set: { [`${perfumeKey}.sizesWithPrices`]: updatedSizes, updatedAt: new Date() } }
        );

        return res.status(200).json({ 
          success: true,
          message: 'Bundle size status updated',
          perfumeNumber,
          size,
          isSoldOut 
        });
      }
      
      // Handle soldout action (default) - for whole product
      const soldOut = req.query.soldOut === 'true' || req.body.soldOut === true;

      const result = await db.collection('products').updateOne(
        { _id: getObjectId(productId) },
        { $set: { soldOut, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({ 
        success: true,
        message: 'Product status updated',
        soldOut 
      });
      
    } catch (error) {
      console.error('Error in soldout handler:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  });
};
