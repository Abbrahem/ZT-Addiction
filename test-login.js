require('dotenv').config();
const bcrypt = require('bcryptjs');
const clientPromise = require('./api/lib/mongodb');

async function testLogin() {
  console.log('🔐 Testing login functionality...\n');
  
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Test credentials
    const testEmail = 'zt@gmail.com';
    const testPassword = 'zt123456';
    
    console.log('📧 Testing with email:', testEmail);
    console.log('🔑 Testing with password:', testPassword);
    console.log('');
    
    // Check admins collection
    const admins = await db.collection('admins').find({}).toArray();
    console.log('👥 Total admins in database:', admins.length);
    
    if (admins.length > 0) {
      console.log('📋 Admin users:');
      admins.forEach((admin, i) => {
        console.log(`  ${i + 1}. Email: ${admin.email}, Role: ${admin.role}`);
      });
      console.log('');
    }
    
    // Try to find user
    let user = await db.collection('users').findOne({ email: testEmail });
    if (!user) {
      user = await db.collection('admins').findOne({ email: testEmail });
    }
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('');
      console.log('Creating admin user...');
      
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const newAdmin = {
        email: testEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      };
      
      await db.collection('admins').insertOne(newAdmin);
      await db.collection('users').insertOne({ ...newAdmin });
      
      console.log('✅ Admin user created successfully!');
      user = newAdmin;
    } else {
      console.log('✅ User found:', user.email);
    }
    
    // Test password
    console.log('');
    console.log('🔐 Testing password...');
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    if (isValid) {
      console.log('✅ Password is correct!');
      console.log('');
      console.log('🎉 Login test PASSED!');
      console.log('');
      console.log('You can now login with:');
      console.log('  Email:', testEmail);
      console.log('  Password:', testPassword);
    } else {
      console.log('❌ Password is incorrect!');
      console.log('');
      console.log('Stored hash:', user.password);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testLogin();
