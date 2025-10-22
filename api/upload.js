const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { requireAuth } = require('./lib/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return requireAuth(req, res, async () => {
    try {
      // Use multer middleware
      upload.single('image')(req, res, async (err) => {
        if (err) {
          console.error('Multer error:', err);
          return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ message: 'No image file provided' });
        }

        const client = await clientPromise;
        const db = client.db('danger-sneakers');

        console.log('📤 Uploading image:', req.file.originalname, 'Size:', req.file.size);

        // Check if using MockDB
        if (client.storeImage) {
          console.log('💾 Using Mock Database for image storage');
          const imageId = client.storeImage(req.file.buffer, req.file.originalname, req.file.mimetype);
          return res.status(200).json({ 
            message: 'Image uploaded successfully',
            imageId: imageId
          });
        }

        // Use GridFS for real MongoDB
        try {
          const bucket = new GridFSBucket(db, { bucketName: 'images' });
          
          const uploadStream = bucket.openUploadStream(req.file.originalname, {
            contentType: req.file.mimetype,
            metadata: {
              uploadDate: new Date(),
              size: req.file.size
            }
          });

          uploadStream.end(req.file.buffer);

          uploadStream.on('finish', () => {
            console.log('✅ Image uploaded to GridFS:', uploadStream.id);
            return res.status(200).json({ 
              message: 'Image uploaded successfully',
              imageId: uploadStream.id
            });
          });

          uploadStream.on('error', (error) => {
            console.error('❌ GridFS upload error:', error);
            return res.status(500).json({ message: 'Error uploading image' });
          });

        } catch (error) {
          console.error('❌ Upload error:', error);
          return res.status(500).json({ message: 'Error uploading image' });
        }
      });
    } catch (error) {
      console.error('❌ Upload handler error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};