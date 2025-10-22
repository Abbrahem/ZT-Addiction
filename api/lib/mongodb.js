const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Mock database for development when MongoDB is not available
class MockDatabase {
  constructor() {
    this.dataFile = path.join(__dirname, '../../mock-data.json');
    this.loadData();
  }

  loadData() {
    // Try to load existing data from file
    if (fs.existsSync(this.dataFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.collections = data;
        console.log('✅ Loaded mock data from file');
        return;
      } catch (error) {
        console.log('⚠️ Error loading mock data, using defaults');
      }
    }

    // Default data if file doesn't exist
    this.collections = {
      products: [
        {
          _id: 'mock_1',
          name: 'Oud Wood Intense',
          priceEGP: 450,
          description: 'Rich and luxurious oud fragrance with woody notes',
          collection: 'Winter Samples',
          size: '5ml',
          sizes: ['5ml'],
          images: ['placeholder_1'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_2',
          name: 'Vanilla Bourbon',
          priceEGP: 380,
          description: 'Sweet and warm vanilla with bourbon undertones',
          collection: 'Winter Samples',
          size: '5ml',
          sizes: ['5ml'],
          images: ['placeholder_2'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_3',
          name: 'Citrus Breeze',
          priceEGP: 350,
          description: 'Fresh and vibrant citrus blend perfect for summer',
          collection: 'Summer Samples',
          size: '5ml',
          sizes: ['5ml'],
          images: ['placeholder_3'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_4',
          name: 'Ocean Mist',
          priceEGP: 370,
          description: 'Aquatic and refreshing marine scent',
          collection: 'Summer Samples',
          size: '5ml',
          sizes: ['5ml'],
          images: ['placeholder_4'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_5',
          name: 'Amber Noir',
          priceEGP: 420,
          description: 'Deep amber with dark mysterious notes',
          collection: 'Winter Samples',
          size: '5ml',
          sizes: ['5ml'],
          images: ['placeholder_5'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_6',
          name: 'Rose Garden',
          priceEGP: 390,
          description: 'Elegant rose bouquet with floral harmony',
          collection: 'Summer Samples',
          size: '5ml',
          sizes: ['5ml'],
          images: ['placeholder_6'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_7',
          name: 'Leather & Spice',
          priceEGP: 460,
          description: 'Bold leather with exotic spices',
          collection: 'Winter Samples',
          size: '5ml',
          sizes: ['5ml'],
          images: ['placeholder_7'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_8',
          name: 'Tropical Paradise',
          priceEGP: 360,
          description: 'Exotic fruits and tropical flowers',
          collection: 'Summer Samples',
          size: '5ml',
          sizes: ['5ml'],
          images: ['placeholder_8'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_9',
          name: 'Winter Bundle',
          priceEGP: 1200,
          description: 'Complete winter collection - 5 premium samples',
          collection: 'Bundles',
          size: 'Bundle',
          sizes: ['Bundle'],
          images: ['placeholder_9'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_10',
          name: 'Summer Bundle',
          priceEGP: 1100,
          description: 'Complete summer collection - 5 refreshing samples',
          collection: 'Bundles',
          size: 'Bundle',
          sizes: ['Bundle'],
          images: ['placeholder_10'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_11',
          name: 'Oud Royale 100ml',
          priceEGP: 2500,
          description: 'Premium oud fragrance in full bottle',
          collection: 'Bottles',
          size: '100ml',
          sizes: ['50ml', '100ml'],
          images: ['placeholder_11'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'mock_12',
          name: 'Vanilla Dreams 100ml',
          priceEGP: 2200,
          description: 'Sweet vanilla in full bottle',
          collection: 'Bottles',
          size: '100ml',
          sizes: ['50ml', '100ml'],
          images: ['placeholder_12'],
          soldOut: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      orders: [],
      users: [
        {
          _id: 'admin_1',
          email: 'zt@gmail.com',
          password: '$2a$10$4cI9ruvVneTC/RA9sYpxjuVrhhgw1yUvwjdcJYY5nlAJRAUkyFgBK',
          role: 'admin',
          createdAt: new Date()
        }
      ],
      admins: [
        {
          _id: 'admin_1',
          email: 'zt@gmail.com',
          password: '$2a$10$4cI9ruvVneTC/RA9sYpxjuVrhhgw1yUvwjdcJYY5nlAJRAUkyFgBK',
          role: 'admin',
          createdAt: new Date()
        }
      ],
      images: []
    };
    this.nextId = 13;
    this.imageStorage = new Map(); // Store image data
  }

  saveData() {
    try {
      // Don't save imageStorage (it's in-memory only)
      fs.writeFileSync(this.dataFile, JSON.stringify(this.collections, null, 2));
      console.log('💾 Saved mock data to file');
    } catch (error) {
      console.error('❌ Error saving mock data:', error.message);
    }
  }

  // Add method to store images
  storeImage(buffer, filename, contentType) {
    const imageId = `img_${this.nextId++}`;
    console.log('MockDB: Storing image with ID:', imageId, 'Size:', buffer.length);

    // Store in memory
    this.imageStorage.set(imageId, {
      buffer,
      filename,
      contentType,
      uploadDate: new Date()
    });

    // Also store metadata in images collection for persistence
    this.collections.images = this.collections.images || [];
    this.collections.images.push({
      _id: imageId,
      filename,
      contentType,
      size: buffer.length,
      uploadDate: new Date(),
      // Store buffer as base64 for JSON serialization
      data: buffer.toString('base64')
    });

    this.saveData();
    console.log('MockDB: Total images stored:', this.imageStorage.size);
    return imageId;
  }

  // Add method to retrieve images
  getImage(imageId) {
    console.log('MockDB: Looking for image:', imageId);

    // First check memory
    let image = this.imageStorage.get(imageId);

    // If not in memory, check persisted data
    if (!image && this.collections.images) {
      const persistedImage = this.collections.images.find(img => img._id === imageId);
      if (persistedImage) {
        console.log('MockDB: Found image in persisted data, loading...');
        // Restore from base64
        image = {
          buffer: Buffer.from(persistedImage.data, 'base64'),
          filename: persistedImage.filename,
          contentType: persistedImage.contentType,
          uploadDate: persistedImage.uploadDate
        };
        // Cache it in memory
        this.imageStorage.set(imageId, image);
      }
    }

    console.log('MockDB: Found image:', image ? 'Yes' : 'No');
    if (image) {
      console.log('MockDB: Image details - Size:', image.buffer.length, 'Type:', image.contentType);
    }
    return image;
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = [];
    }

    return {
      find: (query = {}) => ({
        toArray: () => Promise.resolve(this.collections[name].filter(item => this.matchesQuery(item, query))),
        sort: (sortObj) => ({
          toArray: () => {
            const sorted = [...this.collections[name]].sort((a, b) => {
              const key = Object.keys(sortObj)[0];
              const order = sortObj[key];
              if (order === 1) return a[key] > b[key] ? 1 : -1;
              return a[key] < b[key] ? 1 : -1;
            });
            return Promise.resolve(sorted);
          }
        }),
        limit: (num) => ({
          toArray: () => Promise.resolve(this.collections[name].slice(0, num))
        })
      }),
      findOne: (query) => {
        const item = this.collections[name].find(item => this.matchesQuery(item, query));
        return Promise.resolve(item || null);
      },
      insertOne: (doc) => {
        const id = `mock_${this.nextId++}`;
        const newDoc = { ...doc, _id: id };
        this.collections[name].push(newDoc);
        this.saveData(); // Save after insert
        return Promise.resolve({ insertedId: id });
      },
      updateOne: (query, update) => {
        const index = this.collections[name].findIndex(item => this.matchesQuery(item, query));
        if (index !== -1) {
          if (update.$set) {
            this.collections[name][index] = { ...this.collections[name][index], ...update.$set };
          }
          this.saveData(); // Save after update
          return Promise.resolve({ matchedCount: 1, modifiedCount: 1 });
        }
        return Promise.resolve({ matchedCount: 0, modifiedCount: 0 });
      },
      deleteOne: (query) => {
        const index = this.collections[name].findIndex(item => this.matchesQuery(item, query));
        if (index !== -1) {
          this.collections[name].splice(index, 1);
          this.saveData(); // Save after delete
          return Promise.resolve({ deletedCount: 1 });
        }
        return Promise.resolve({ deletedCount: 0 });
      },
      deleteMany: (query) => {
        const initialLength = this.collections[name].length;
        if (Object.keys(query).length === 0) {
          // Delete all
          this.collections[name] = [];
        } else {
          this.collections[name] = this.collections[name].filter(item => !this.matchesQuery(item, query));
        }
        const deletedCount = initialLength - this.collections[name].length;
        if (deletedCount > 0) {
          this.saveData(); // Save after delete
        }
        return Promise.resolve({ deletedCount });
      },
      insertMany: (docs) => {
        const insertedIds = [];
        docs.forEach(doc => {
          const id = `mock_${this.nextId++}`;
          const newDoc = { ...doc, _id: id };
          this.collections[name].push(newDoc);
          insertedIds.push(id);
        });
        this.saveData(); // Save after insert
        return Promise.resolve({ insertedCount: docs.length, insertedIds });
      }
    };
  }

  matchesQuery(item, query) {
    if (Object.keys(query).length === 0) return true;

    for (const [key, value] of Object.entries(query)) {
      if (key === '_id') {
        if (item._id !== value && item._id !== value.toString()) return false;
      } else if (item[key] !== value) {
        return false;
      }
    }
    return true;
  }

  db(name) {
    return this;
  }
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority'
};

let client;
let clientPromise;
let useMockDB = false;

// Try to connect to MongoDB, fallback to Mock DB if it fails
if (!uri) {
  console.log('⚠️ No MONGODB_URI found, using Mock Database');
  useMockDB = true;
  const mockClient = new MockDatabase();
  clientPromise = Promise.resolve(mockClient);
} else {
  console.log('🔄 Attempting to connect to MongoDB...');
  client = new MongoClient(uri, options);

  clientPromise = client.connect()
    .then((connectedClient) => {
      console.log('✅ Successfully connected to MongoDB');
      useMockDB = false;
      return connectedClient;
    })
    .catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('🔧 Falling back to Mock Database');
      useMockDB = true;
      const mockClient = new MockDatabase();
      return mockClient;
    });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
module.exports = clientPromise;
