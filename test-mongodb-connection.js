require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...\n');
  
  const uri = process.env.MONGODB_URI;
  console.log('📝 URI:', uri ? 'Found' : 'Missing');
  
  if (!uri) {
    console.log('❌ No MONGODB_URI in .env file');
    return;
  }
  
  // Try different connection options
  const options = [
    {
      name: 'Default Options',
      opts: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      }
    },
    {
      name: 'With SSL',
      opts: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        ssl: true,
        sslValidate: false
      }
    },
    {
      name: 'Direct Connection',
      opts: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        directConnection: false
      }
    }
  ];
  
  for (const { name, opts } of options) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log('Options:', JSON.stringify(opts, null, 2));
    
    try {
      const client = new MongoClient(uri, opts);
      await client.connect();
      
      console.log('✅ Connection successful!');
      
      // Test database operations
      const db = client.db('danger-sneakers');
      const collections = await db.listCollections().toArray();
      console.log('📦 Collections:', collections.map(c => c.name).join(', '));
      
      await client.close();
      console.log('✅ Connection closed successfully');
      return; // Success, exit
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
    }
  }
  
  console.log('\n💡 All connection attempts failed. Possible solutions:');
  console.log('1. Check if MongoDB Atlas cluster is running');
  console.log('2. Verify username/password in connection string');
  console.log('3. Add your IP address to MongoDB Atlas whitelist');
  console.log('4. Check if cluster URL is correct');
  console.log('5. Try creating a new database user');
}

testConnection().then(() => process.exit(0)).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});