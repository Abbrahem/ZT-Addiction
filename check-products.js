require('dotenv').config();
const clientPromise = require('./api/lib/mongodb');

async function checkProducts() {
  console.log('📦 Checking products in database...\n');
  
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    const products = await db.collection('products').find({}).toArray();
    
    console.log(`Total products: ${products.length}\n`);
    
    if (products.length === 0) {
      console.log('❌ No products found in database!');
      console.log('Add products from Admin Dashboard.');
    } else {
      console.log('Products:');
      products.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   ID: ${p._id}`);
        console.log(`   Price: ${p.priceEGP} EGP`);
        console.log(`   Collection: ${p.collection}`);
        console.log(`   Images: ${p.images?.length || 0}`);
        if (p.images && p.images.length > 0) {
          console.log(`   Image IDs: ${p.images.join(', ')}`);
        }
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProducts();
