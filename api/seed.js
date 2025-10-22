const { seedAdmin } = require('./lib/seedAdmin');
const clientPromise = require('./lib/mongodb');

const seedProducts = async () => {
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Check if products already exist
    const existingProducts = await db.collection('products').countDocuments();
    
    if (existingProducts === 0) {
      const sampleProducts = [
        {
          name: 'Dior Sauvage',
          priceEGP: 350,
          description: 'A powerful and noble fragrance with fresh and woody notes',
          collection: 'Winter Samples',
          size: '10ml',
          sizes: ['10ml'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Chanel Bleu de Chanel',
          priceEGP: 400,
          description: 'An aromatic woody fragrance that embodies freedom',
          collection: 'Winter Samples',
          size: '10ml',
          sizes: ['10ml'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Tom Ford Oud Wood',
          priceEGP: 500,
          description: 'A composition of exotic, smoky woods including rare oud',
          collection: 'Winter Samples',
          size: '5ml',
          sizes: ['5ml'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Versace Eros',
          priceEGP: 300,
          description: 'A fresh oriental woody fragrance with mint and vanilla',
          collection: 'Summer Samples',
          size: '10ml',
          sizes: ['10ml'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Acqua di Gio',
          priceEGP: 350,
          description: 'A fresh aquatic fragrance inspired by the sea',
          collection: 'Summer Samples',
          size: '10ml',
          sizes: ['10ml'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Luxury Perfume Bundle',
          priceEGP: 1200,
          description: 'A collection of 5 premium perfume samples',
          collection: 'Bundles',
          size: '50ml',
          sizes: ['50ml'],
          images: [],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await db.collection('products').insertMany(sampleProducts);
      console.log('Sample products seeded successfully');
      return { productsSeeded: sampleProducts.length };
    }
    
    return { productsSeeded: 0, message: 'Products already exist' };
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await seedAdmin();
    const productResult = await seedProducts();
    res.status(200).json({ 
      message: 'Seeding completed successfully',
      admin: 'Admin user seeded',
      products: productResult
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Failed to seed data', error: error.message });
  }
}
