const { GridFSBucket } = require('mongodb');
const clientPromise = require('./mongodb');

let gfs;
let mockClient;

const getGridFS = async () => {
  if (!gfs) {
    const client = await clientPromise;
    
    // Check if it's a mock database
    if (client.storeImage) {
      mockClient = client;
      return null; // Return null for mock database
    }
    
    const db = client.db('danger-sneakers');
    gfs = new GridFSBucket(db, { bucketName: 'images' });
  }
  return gfs;
};

const uploadToGridFS = async (buffer, filename, contentType) => {
  const gridfs = await getGridFS();
  
  // Handle mock database
  if (!gridfs && mockClient) {
    console.log('Storing image in mock database:', filename, 'Size:', buffer.length);
    const imageId = mockClient.storeImage(buffer, filename, contentType);
    console.log('Mock database stored image with ID:', imageId);
    return imageId;
  }
  
  // Handle real GridFS
  return new Promise((resolve, reject) => {
    const uploadStream = gridfs.openUploadStream(filename, {
      contentType,
      metadata: { originalName: filename }
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });

    uploadStream.end(buffer);
  });
};

const downloadFromGridFS = async (id) => {
  const gridfs = await getGridFS();
  
  // Handle mock database
  if (!gridfs && mockClient) {
    console.log('Looking for image with ID:', id);
    const imageData = mockClient.getImage(id);
    console.log('Found image data:', imageData ? 'Yes' : 'No');
    
    if (!imageData) {
      console.log('Image not found in mock storage');
      throw new Error('Image not found');
    }
    
    // Create a readable stream from buffer
    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(imageData.buffer);
    stream.push(null);
    
    // Add metadata
    stream.contentType = imageData.contentType;
    console.log('Serving image with content type:', imageData.contentType);
    return stream;
  }
  
  // Handle real GridFS
  return gridfs.openDownloadStream(id);
};

module.exports = {
  getGridFS,
  uploadToGridFS,
  downloadFromGridFS
};
