require('dotenv').config();
const bcrypt = require('bcryptjs');
const clientPromise = require('./api/lib/mongodb');

async function fixAdminPassword() {
  console.log('🔧 Fixing admin password...\n');
  
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    const email = 'zt@gmail.com';
    const newPassword = 'zt123456';
    
    // Find the user
    let user = await db.collection('admins').findOne({ email });
    
    if (!user) {
      console.log('❌ Admin not found!');
      return;
    }
    
    console.log('📧 Found admin:', email);
    console.log('🔑 Old password hash:', user.password);
    console.log('');
    
    // Create new hash
    const newHash = await bcrypt.hash(newPassword, 10);
    console.log('🔑 New password hash:', newHash);
    console.log('');
    
    // Test the new hash
    const testResult = await bcrypt.compare(newPassword, newHash);
    console.log('✅ Hash test:', testResult ? 'PASSED' : 'FAILED');
    console.log('');
    
    // Update in both collections
    await db.collection('admins').updateOne(
      { email },
      { $set: { password: newHash, updatedAt: new Date() } }
    );
    
    await db.collection('users').updateOne(
      { email },
      { $set: { password: newHash, updatedAt: new Date() } }
    );
    
    console.log('✅ Password updated successfully!');
    console.log('');
    console.log('You can now login with:');
    console.log('  Email:', email);
    console.log('  Password:', newPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdminPassword();
