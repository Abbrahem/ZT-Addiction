const { ObjectId } = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { requireAuth } = require('./lib/auth');

module.exports = async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('danger-sneakers');

  try {
    // GET /api/products - Get all products
    if (req.method === 'GET') {
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

    // POST /api/products - Create new product
    if (req.method === 'POST') {
      return requireAuth(req, res, async () => {
        const { name, priceEGP, description, collection, size, images } = req.body;

        if (!name || !priceEGP || !collection || !size) {
          return res.status(400).json({ message: 'Name, price, collection, and size are required' });
        }

        const product = {
          name,
          priceEGP: parseFloat(priceEGP),
          description: description || '',
          collection,
          size,
          sizes: [size], // Keep for compatibility
          images: images || [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await db.collection('products').insertOne(product);
        console.log('✅ Product created:', result.insertedId);
        return res.status(201).json({ 
          message: 'Product created successfully',
          productId: result.insertedId
        });
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
