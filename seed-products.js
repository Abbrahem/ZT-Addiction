const { MongoClient } = require('mongodb');
require('dotenv').config();

const products = [
  {
    _id: '1',
    name: 'Nike Air Jordan 1 Retro High',
    priceEGP: 8500,
    description: 'Classic basketball shoe with premium leather construction',
    brand: 'Nike',
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['Black', 'White', 'Red'],
    images: [],
    soldOut: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Adidas Yeezy Boost 350',
    priceEGP: 12000,
    description: 'Comfortable and stylish sneaker with boost technology',
    brand: 'Adidas',
    sizes: ['39', '40', '41', '42', '43'],
    colors: ['Black', 'White'],
    images: [],
    soldOut: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    name: 'Off-White x Nike Air Force 1',
    priceEGP: 15000,
    description: 'Limited edition collaboration sneaker',
    brand: 'oof-white',
    sizes: ['40', '41', '42', '43'],
    colors: ['White', 'Black'],
    images: [],
    soldOut: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '4',
    name: 'Balenciaga Triple S',
    priceEGP: 18000,
    description: 'Chunky luxury sneaker with distinctive design',
    brand: 'Blanciaga',
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['White', 'Black', 'Gray'],
    images: [],
    soldOut: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '5',
    name: 'Louis Vuitton Trainer',
    priceEGP: 25000,
    description: 'Luxury sneaker with premium materials',
    brand: 'Louis vutiune',
    sizes: ['40', '41', '42', '43'],
    colors: ['White', 'Black', 'Brown'],
    images: [],
    soldOut: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '6',
    name: 'Dior B23 High-Top',
    priceEGP: 22000,
    description: 'High-end fashion sneaker with oblique pattern',
    brand: 'Dior',
    sizes: ['39', '40', '41', '42', '43'],
    colors: ['White', 'Black'],
    images: [],
    soldOut: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedProducts() {
  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('danger-sneakers');
    const collection = db.collection('products');
    
    // Clear existing products
    await collection.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new products
    const result = await collection.insertMany(products);
    console.log(`Inserted ${result.insertedCount} products`);
    
    // Verify insertion
    const count = await collection.countDocuments();
    console.log(`Total products in database: ${count}`);
    
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

seedProducts();
