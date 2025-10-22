require('dotenv').config();
const clientPromise = require('./api/lib/mongodb');

const products = [
  {
    name: 'عطر عود وود انتنس',
    priceEGP: 450,
    description: 'عطر فاخر بنفحات العود الغنية مع لمسات خشبية دافئة',
    collection: 'عينات شتوية',
    size: '5ml',
    sizes: ['5ml'],
    images: [],
    soldOut: false
  },
  {
    name: 'عطر فانيليا بوربون',
    priceEGP: 380,
    description: 'عطر حلو ودافئ بالفانيليا مع لمسات البوربون',
    collection: 'عينات شتوية',
    size: '5ml',
    sizes: ['5ml'],
    images: [],
    soldOut: false
  },
  {
    name: 'عطر سيتروس بريز',
    priceEGP: 350,
    description: 'عطر منعش وحيوي بمزيج الحمضيات المثالي للصيف',
    collection: 'عينات صيفية',
    size: '5ml',
    sizes: ['5ml'],
    images: [],
    soldOut: false
  },
  {
    name: 'عطر أوشن ميست',
    priceEGP: 370,
    description: 'عطر مائي منعش برائحة البحر',
    collection: 'عينات صيفية',
    size: '5ml',
    sizes: ['5ml'],
    images: [],
    soldOut: false
  },
  {
    name: 'عطر عنبر نوار',
    priceEGP: 420,
    description: 'عطر عنبر عميق بنفحات غامضة',
    collection: 'عينات شتوية',
    size: '5ml',
    sizes: ['5ml'],
    images: [],
    soldOut: false
  },
  {
    name: 'عطر روز جاردن',
    priceEGP: 390,
    description: 'باقة ورد أنيقة بتناغم زهري',
    collection: 'عينات صيفية',
    size: '5ml',
    sizes: ['5ml'],
    images: [],
    soldOut: false
  },
  {
    name: 'عطر ليذر آند سبايس',
    priceEGP: 460,
    description: 'جلد جريء مع توابل غريبة',
    collection: 'عينات شتوية',
    size: '5ml',
    sizes: ['5ml'],
    images: [],
    soldOut: false
  },
  {
    name: 'عطر تروبيكال بارادايس',
    priceEGP: 360,
    description: 'فواكه استوائية وزهور غريبة',
    collection: 'عينات صيفية',
    size: '5ml',
    sizes: ['5ml'],
    images: [],
    soldOut: false
  }
];

async function seedProducts() {
  console.log('🌱 Seeding products to MongoDB...\n');
  
  try {
    const client = await clientPromise;
    const db = client.db('danger-sneakers');
    
    // Clear existing products
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products\n`);
    
    // Insert new products
    const insertResult = await db.collection('products').insertMany(
      products.map(p => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    
    console.log(`✅ Inserted ${insertResult.insertedCount} products\n`);
    
    // Verify
    const allProducts = await db.collection('products').find({}).toArray();
    console.log('📦 Products in database:');
    allProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} - ${p.priceEGP} EGP`);
    });
    
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
}

seedProducts();
