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
    const urlParts = req.url.split('/');
    const productId = urlParts[urlParts.length - 2];
    
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