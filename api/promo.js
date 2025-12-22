const { ObjectId } = require('mongodb');
const clientPromise = require('./lib/mongodb');

module.exports = async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('danger-sneakers');

  try {
    // GET /api/promo - Get all promo codes (admin only)
    if (req.method === 'GET') {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(401).json({ message: 'Access denied' });
      }

      const jwt = require('jsonwebtoken');
      jwt.verify(token, process.env.JWT_SECRET);

      const promoCodes = await db.collection('promoCodes').find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(promoCodes);
    }

    // POST /api/promo - Create promo code (admin only)
    if (req.method === 'POST') {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(401).json({ message: 'Access denied' });
      }

      const jwt = require('jsonwebtoken');
      jwt.verify(token, process.env.JWT_SECRET);

      const { discount, maxUses, expiryDays } = req.body;

      if (!discount || !maxUses || !expiryDays) {
        return res.status(400).json({ message: 'All fields required' });
      }

      const code = 'ZT' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));

      const promoCode = {
        code,
        discount: parseInt(discount),
        maxUses: parseInt(maxUses),
        currentUses: 0,
        expiryDate,
        active: true,
        createdAt: new Date()
      };

      await db.collection('promoCodes').insertOne(promoCode);
      return res.status(201).json({ message: 'Success', promoCode });
    }

    // PATCH /api/promo - Validate promo code (public)
    if (req.method === 'PATCH') {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: 'Code required' });
      }

      const promoCode = await db.collection('promoCodes').findOne({ code: code.toUpperCase() });
      if (!promoCode) {
        return res.status(404).json({ message: 'Invalid code' });
      }

      if (!promoCode.active || new Date() > new Date(promoCode.expiryDate) || promoCode.currentUses >= promoCode.maxUses) {
        return res.status(400).json({ message: 'Code expired or used up' });
      }

      return res.status(200).json({ valid: true, discount: promoCode.discount, code: promoCode.code });
    }

    // DELETE /api/promo - Delete promo code (admin only)
    if (req.method === 'DELETE') {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(401).json({ message: 'Access denied' });
      }

      const jwt = require('jsonwebtoken');
      jwt.verify(token, process.env.JWT_SECRET);

      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: 'Code required' });
      }

      const result = await db.collection('promoCodes').deleteOne({ code: code.toUpperCase() });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Code not found' });
      }

      return res.status(200).json({ message: 'Deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Promo API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}