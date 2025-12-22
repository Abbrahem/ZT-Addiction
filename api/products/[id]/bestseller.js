const { ObjectId } = require('mongodb');
const clientPromise = require('../../lib/mongodb');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const client = await clientPromise;
  const db = client.db('danger-sneakers');

  // Extract product ID from URL
  const urlParts = req.url.split('/');
  const productIdIndex = urlParts.findIndex(part => part === 'products') + 1;
  const productId = urlParts[productIdIndex];

  return requireAuth(req, res, async () => {
    try {
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
    } catch (error) {
      console.error('BestSeller API error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};
