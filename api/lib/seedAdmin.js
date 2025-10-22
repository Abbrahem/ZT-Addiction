const bcrypt = require('bcryptjs');
const clientPromise = require('./mongodb');

const seedAdmin = async () => {
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Check if admin already exists in admins collection
    const existingAdmin = await db.collection('admins').findOne({});
    
    if (!existingAdmin) {
      const adminEmail = process.env.ADMIN_EMAIL || 'zt@gmail.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'zt123456';
      
      console.log('🔐 Creating admin user:', adminEmail);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = {
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      };
      
      // Insert into both collections for compatibility
      await db.collection('admins').insertOne(adminUser);
      await db.collection('users').insertOne({ ...adminUser });
      
      console.log('✅ Admin user created successfully');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    throw error;
  }
};

module.exports = { seedAdmin };
