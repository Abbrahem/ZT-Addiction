require('dotenv').config();
const clientPromise = require('./api/lib/mongodb');

async function clearProducts() {
  console.log('🗑️  Clearing all products...\n');
  
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    const result = await db.collection('products').deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} products\n`);
    
    const count = await db.collection('products').find({}).toArray();
    console.log(`📦 Products remaining: ${count.length}\n`);
    
    console.log('✅ Database is now empty. You can add products from Admin Dashboard!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearProducts();
