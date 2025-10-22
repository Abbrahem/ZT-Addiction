require('dotenv').config();
const clientPromise = require('./api/lib/mongodb');

async function checkImage() {
  const imageId = '68f8d86cf3260e6cbc00f697';
  console.log('🔍 Checking image:', imageId, '\n');
  
  try {
    const client = await clientPromise;
    
    // Check if it's mock DB
    if (client.getImage) {
      console.log('📦 Using Mock Database\n');
      const image = client.getImage(imageId);
      
      if (image) {
        console.log('✅ Image found!');
        console.log('   Size:', image.buffer.length, 'bytes');
        console.log('   Type:', image.contentType);
        console.log('   Filename:', image.filename);
      } else {
        console.log('❌ Image not found in Mock DB');
        
        // Check all images
        const db = client.db('danger-sneakers');
        const allImages = await db.collection('images').find({}).toArray();
        console.log('\n📋 All images in database:', allImages.length);
        allImages.forEach((img, i) => {
          console.log(`   ${i + 1}. ID: ${img._id}, File: ${img.filename}, Size: ${img.size}`);
        });
      }
    } else {
      console.log('🌐 Using Real MongoDB');
      const db = client.db('danger-sneakers');
      // Check GridFS
      const files = await db.collection('images.files').find({}).toArray();
      console.log('Images in GridFS:', files.length);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkImage();
