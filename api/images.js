const { GridFSBucket, ObjectId, MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const mongoOptions = { serverSelectionTimeoutMS: 30000, socketTimeoutMS: 45000, connectTimeoutMS: 30000, retryWrites: true, w: 'majority' };
let _client, _clientPromise;
if (process.env.NODE_ENV === 'production') { _client = new MongoClient(uri, mongoOptions); _clientPromise = _client.connect(); }
else { if (!global._mongoImagesPromise) { _client = new MongoClient(uri, mongoOptions); global._mongoImagesPromise = _client.connect(); } _clientPromise = global._mongoImagesPromise; }
const clientPromise = _clientPromise;

function handleCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://www.zt-addiction.com','https://zt-addiction.com','https://zt-addiction.vercel.app','http://localhost:3000','capacitor://localhost','https://localhost'];
  if (allowed.includes(origin) || /\.vercel\.app$/.test(origin) || !origin) res.setHeader('Access-Control-Allow-Origin', origin || '*');
  else res.setHeader('Access-Control-Allow-Origin', 'https://www.zt-addiction.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');

    // Extract image ID from URL
    const urlParts = req.url.split('/');
    const imageId = urlParts[urlParts.length - 1].split('?')[0];

    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }

    // Check if it's a placeholder image
    if (imageId.startsWith('placeholder_')) {
      const num = imageId.replace('placeholder_', '');
      // Generate a colorful SVG placeholder
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
      const color = colors[parseInt(num) % colors.length];

      const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${num}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.4" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad${num})"/>
        <circle cx="200" cy="150" r="60" fill="white" opacity="0.3"/>
        <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">عطر ${num}</text>
      </svg>`;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(svg);
    }

    console.log('🔍 Looking for image:', imageId);
    console.log('🔍 Request URL:', req.url);
    console.log('🔍 Image ID type:', typeof imageId, 'Length:', imageId.length);

    // Try to parse as ObjectId first (for real MongoDB)
    let objectId;
    let isValidObjectId = false;
    try {
      objectId = new ObjectId(imageId);
      isValidObjectId = true;
      console.log('✅ Valid ObjectId format');
    } catch (error) {
      console.log('⚠️ Not a valid ObjectId, checking Mock DB');
    }

    // If valid ObjectId, try GridFS first
    if (isValidObjectId) {
      try {
        const bucket = new GridFSBucket(db, { bucketName: 'images' });
        const files = await bucket.find({ _id: objectId }).toArray();

        if (files.length > 0) {
          const file = files[0];
          console.log('✅ Found image in GridFS:', file.filename);

          res.setHeader('Content-Type', file.contentType || 'image/jpeg');
          res.setHeader('Content-Length', file.length);
          res.setHeader('Cache-Control', 'public, max-age=31536000');

          const downloadStream = bucket.openDownloadStream(objectId);

          downloadStream.on('error', (error) => {
            console.error('❌ GridFS download error:', error);
            if (!res.headersSent) {
              res.status(500).json({ message: 'Error retrieving image' });
            }
          });

          return downloadStream.pipe(res);
        } else {
          console.log('⚠️ Image not found in GridFS');
        }
      } catch (gridfsError) {
        console.log('⚠️ GridFS error:', gridfsError.message);
      }
    }

    // Check MockDB as fallback
    if (client.getImage) {
      console.log('🔍 Checking Mock DB for:', imageId);
      const mockImage = client.getImage(imageId);
      if (mockImage) {
        console.log('✅ Found image in Mock DB, size:', mockImage.buffer.length);
        res.setHeader('Content-Type', mockImage.contentType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.send(mockImage.buffer);
      }
    }

    // Check images collection for base64 stored images
    try {
      console.log('🔍 Checking images collection for:', imageId);
      let imageDoc;

      // Try as ObjectId first
      try {
        imageDoc = await db.collection('images').findOne({ _id: new ObjectId(imageId) });
      } catch (error) {
        // Try as string ID
        imageDoc = await db.collection('images').findOne({ _id: imageId });
      }

      if (imageDoc && imageDoc.data) {
        console.log('✅ Found image in collection, size:', imageDoc.size);
        const buffer = Buffer.from(imageDoc.data, 'base64');
        res.setHeader('Content-Type', imageDoc.contentType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.send(buffer);
      } else {
        console.log('⚠️ Image document not found or no data field');
      }
    } catch (collectionError) {
      console.log('⚠️ Error checking images collection:', collectionError.message);
    }

    // Image not found anywhere
    console.log('❌ Image not found:', imageId);
    const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#999" text-anchor="middle" dy=".3em">صورة غير متوفرة</text>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    return res.send(svg);

  } catch (error) {
    console.error('Images API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
