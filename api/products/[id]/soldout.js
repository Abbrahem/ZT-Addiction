const { ObjectId } = require('mongodb');
const clientPromise = require('../../lib/mongodb');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return requireAuth(req, res, async () => {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Extract product ID from URL
    const urlParts = req.url.split('?')[0].split('/');
    const productId = urlParts[urlParts.length - 2];
    
    // Check action type from query or body
    const action = req.query?.action || req.body?.action || 'soldout';
    
    // Handle bestseller action
    if (action === 'bestseller') {
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
    }
    
    // Handle soldout action (default)
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
};