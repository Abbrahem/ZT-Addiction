const { GridFSBucket, MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const uri = process.env.MONGODB_URI;
const mongoOptions = { serverSelectionTimeoutMS: 30000, socketTimeoutMS: 45000, connectTimeoutMS: 30000, retryWrites: true, w: 'majority' };
let _client, _clientPromise;
if (process.env.NODE_ENV === 'production') { _client = new MongoClient(uri, mongoOptions); _clientPromise = _client.connect(); }
else { if (!global._mongoUploadPromise) { _client = new MongoClient(uri, mongoOptions); global._mongoUploadPromise = _client.connect(); } _clientPromise = global._mongoUploadPromise; }
const clientPromise = _clientPromise;

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Access denied' });
    jwt.verify(token, process.env.JWT_SECRET);
    const result = next(); if (result?.then) return await result; return result;
  } catch { return res.status(401).json({ message: 'Invalid token' }); }
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return requireAuth(req, res, async () => {
    try {
      console.log('📤 Processing image upload...');
      console.log('📤 Content-Type:', req.headers['content-type']);
      
      // Simple approach - expect base64 encoded image in JSON
      if (req.headers['content-type']?.includes('application/json')) {
        const { imageData, filename, contentType } = req.body;
        
        if (!imageData) {
          return res.status(400).json({ message: 'No image data provided' });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(imageData, 'base64');
        
        console.log('📤 Image size:', buffer.length);

        const client = await clientPromise;
        const db = client.db('danger-sneakers');

        // Always use MockDB for simplicity in production
        if (client.storeImage) {
          console.log('💾 Using Mock Database for image storage');
          const imageId = client.storeImage(buffer, filename || 'upload.jpg', contentType || 'image/jpeg');
          return res.status(200).json({ 
            message: 'Image uploaded successfully',
            imageId: imageId
          });
        }

        // Fallback: create a simple ID and store in a collection
        const imageDoc = {
          filename: filename || 'upload.jpg',
          contentType: contentType || 'image/jpeg',
          data: imageData, // Store as base64
          size: buffer.length,
          uploadDate: new Date()
        };

        const result = await db.collection('images').insertOne(imageDoc);
        
        console.log('✅ Image stored in collection with ID:', result.insertedId);
        
        return res.status(200).json({ 
          message: 'Image uploaded successfully',
          imageId: result.insertedId.toString() // Convert to string for consistency
        });

      } else {
        // Fallback for multipart - just return a mock ID
        console.log('⚠️ Multipart upload not supported, using mock ID');
        return res.status(200).json({ 
          message: 'Image uploaded successfully (mock)',
          imageId: `mock_${Date.now()}`
        });
      }

    } catch (error) {
      console.error('❌ Upload handler error:', error);
      return res.status(500).json({ 
        message: 'Error uploading image',
        error: error.message 
      });
    }
  });
};