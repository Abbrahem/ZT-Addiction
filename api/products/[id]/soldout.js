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

    // Handle bestreview action
    if (action === 'bestreview') {
      const { isBestReview } = req.body;

      if (typeof isBestReview !== 'boolean') {
        return res.status(400).json({ message: 'isBestReview must be a boolean value' });
      }

      // If setting as best review, check if we already have 4
      if (isBestReview) {
        const bestReviewCount = await db.collection('products').countDocuments({ isBestReview: true });
        if (bestReviewCount >= 4) {
          return res.status(400).json({ message: 'Maximum 4 best reviews allowed. Remove one first.' });
        }
      }

      let result;
      try {
        result = await db.collection('products').updateOne(
          { _id: new ObjectId(productId) },
          { $set: { isBestReview, updatedAt: new Date() } }
        );
      } catch (error) {
        result = await db.collection('products').updateOne(
          { _id: productId },
          { $set: { isBestReview, updatedAt: new Date() } }
        );
      }

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({ 
        message: 'Best review status updated successfully',
        isBestReview 
      });
    }

    // Handle size soldout action
    if (action === 'sizeSoldout') {
      const { size, isSoldOut } = req.body;

      if (!size) {
        return res.status(400).json({ message: 'Size is required' });
      }

      if (typeof isSoldOut !== 'boolean') {
        return res.status(400).json({ message: 'isSoldOut must be a boolean value' });
      }

      // Get the product first
      let product;
      try {
        product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      } catch (error) {
        product = await db.collection('products').findOne({ _id: productId });
      }

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

      let result;
      try {
        result = await db.collection('products').updateOne(
          { _id: new ObjectId(productId) },
          { $set: { sizesWithPrices: updatedSizes, updatedAt: new Date() } }
        );
      } catch (error) {
        result = await db.collection('products').updateOne(
          { _id: productId },
          { $set: { sizesWithPrices: updatedSizes, updatedAt: new Date() } }
        );
      }

      return res.status(200).json({ 
        message: 'Size sold out status updated successfully',
        size,
        isSoldOut 
      });
    }

    // Handle bundle size soldout action
    if (action === 'bundleSizeSoldout') {
      const { perfumeNumber, size, isSoldOut } = req.body;

      console.log('Bundle size soldout request:', { perfumeNumber, size, isSoldOut });

      if (!perfumeNumber || !size) {
        console.log('Missing perfumeNumber or size');
        return res.status(400).json({ message: 'Perfume number and size are required' });
      }

      if (typeof isSoldOut !== 'boolean') {
        console.log('isSoldOut is not boolean:', typeof isSoldOut);
        return res.status(400).json({ message: 'isSoldOut must be a boolean value' });
      }

      // Get the product first
      let product;
      try {
        product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      } catch (error) {
        product = await db.collection('products').findOne({ _id: productId });
      }

      if (!product) {
        console.log('Product not found:', productId);
        return res.status(404).json({ message: 'Product not found' });
      }

      console.log('Product found:', product.name);

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
        console.log('Perfume or sizes not found:', perfumeKey);
        return res.status(404).json({ message: 'Perfume or sizes not found' });
      }

      console.log('Current sizes:', perfume.sizesWithPrices);

      const updatedSizes = perfume.sizesWithPrices.map(item => {
        if (item.size === size) {
          return { ...item, soldOut: isSoldOut };
        }
        return item;
      });

      console.log('Updated sizes:', updatedSizes);

      let result;
      try {
        result = await db.collection('products').updateOne(
          { _id: new ObjectId(productId) },
          { $set: { [`${perfumeKey}.sizesWithPrices`]: updatedSizes, updatedAt: new Date() } }
        );
      } catch (error) {
        result = await db.collection('products').updateOne(
          { _id: productId },
          { $set: { [`${perfumeKey}.sizesWithPrices`]: updatedSizes, updatedAt: new Date() } }
        );
      }

      console.log('Update result:', result);

      return res.status(200).json({ 
        message: 'Bundle size sold out status updated successfully',
        perfumeNumber,
        size,
        isSoldOut 
      });
    }
    
    // Handle soldout action (default) - for whole product
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