require('dotenv').config();
const clientPromise = require('./api/lib/mongodb');

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...');
  console.log('📝 MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
  
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Try to list collections
    const collections = await db.listCollections ? 
      await db.listCollections().toArray() : 
      ['Mock DB - No collections list available'];
    
    console.log('✅ Database connection successful!');
    console.log('📦 Collections:', collections.map(c => c.name || c).join(', '));
    
    // Test admin collection
    const admins = await db.collection('admins').find({}).toArray();
    console.log('👤 Admin users found:', admins.length);
    
    if (admins.length > 0) {
      console.log('📧 Admin emails:', admins.map(a => a.email).join(', '));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
