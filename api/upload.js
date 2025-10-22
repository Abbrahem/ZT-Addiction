const { GridFSBucket } = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { requireAuth } = require('./lib/auth');

// Parse multipart form data manually for Vercel compatibility
const parseMultipartData = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const boundary = req.headers['content-type'].split('boundary=')[1];
        
        if (!boundary) {
          return reject(new Error('No boundary found'));
        }
        
        const parts = buffer.toString('binary').split(`--${boundary}`);
        
        for (const part of parts) {
          if (part.includes('Content-Disposition: form-data; name="image"')) {
            const lines = part.split('\r\n');
            let contentType = 'image/jpeg';
            let filename = 'upload.jpg';
            
            // Extract content type and filename
            for (const line of lines) {
              if (line.includes('Content-Type:')) {
                contentType = line.split('Content-Type: ')[1];
              }
              if (line.includes('filename=')) {
                filename = line.split('filename="')[1].split('"')[0];
              }
            }
            
            // Find the actual file data (after double CRLF)
            const dataStart = part.indexOf('\r\n\r\n') + 4;
            const dataEnd = part.lastIndexOf('\r\n');
            
            if (dataStart > 3 && dataEnd > dataStart) {
              const fileData = Buffer.from(part.slice(dataStart, dataEnd), 'binary');
              
              return resolve({
                buffer: fileData,
                originalname: filename,
                mimetype: contentType,
                size: fileData.length
              });
            }
          }
        }
        
        reject(new Error('No image file found'));
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', reject);
  });
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return requireAuth(req, res, async () => {
    try {
      console.log('📤 Processing image upload...');
      
      // Parse multipart data manually
      const fileData = await parseMultipartData(req);
      
      if (!fileData || !fileData.buffer) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Validate file type
      if (!fileData.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'Only image files are allowed' });
      }

      // Validate file size (10MB limit)
      if (fileData.size > 10 * 1024 * 1024) {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB' });
      }

      const client = await clientPromise;
      const db = client.db('danger-sneakers');

      console.log('📤 Uploading image:', fileData.originalname, 'Size:', fileData.size);

      // Check if using MockDB
      if (client.storeImage) {
        console.log('💾 Using Mock Database for image storage');
        const imageId = client.storeImage(fileData.buffer, fileData.originalname, fileData.mimetype);
        return res.status(200).json({ 
          message: 'Image uploaded successfully',
          imageId: imageId
        });
      }

      // Use GridFS for real MongoDB
      try {
        const bucket = new GridFSBucket(db, { bucketName: 'images' });
        
        const uploadStream = bucket.openUploadStream(fileData.originalname, {
          contentType: fileData.mimetype,
          metadata: {
            uploadDate: new Date(),
            size: fileData.size
          }
        });

        uploadStream.end(fileData.buffer);

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

    } catch (error) {
      console.error('❌ Upload handler error:', error);
      return res.status(500).json({ message: 'Error parsing upload data' });
    }
  });
};