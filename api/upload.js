const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { requireAuth } = require('./lib/auth');
const { uploadToGridFS } = require('./lib/gridfs');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

async function uploadImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    console.log('Uploading', req.files.length, 'images');
    const imageIds = [];
    
    for (const file of req.files) {
      console.log('Processing file:', file.originalname, 'Size:', file.buffer.length, 'Type:', file.mimetype);
      
      const imageId = await uploadToGridFS(
        file.buffer,
        file.originalname,
        file.mimetype
      );
      
      console.log('Generated image ID:', imageId);
      imageIds.push(imageId);
    }

    console.log('All images uploaded successfully. IDs:', imageIds);
    res.status(200).json({ 
      message: 'Images uploaded successfully',
      imageIds 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return requireAuth(req, res, () => {
    upload.array('images', 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      return uploadImages(req, res);
    });
  });
};
