const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Theme } = require('./build/models/theme.model');
const { Store } = require('./build/models/store/store.model');
const { User } = require('./build/models/user.model');

async function createTestTheme() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ziplofy');
    console.log('Connected to database');

    // Create a test theme
    const testTheme = await Theme.create({
      name: 'Test Theme',
      description: 'A beautiful test theme for demonstration',
      category: 'ecommerce',
      price: 0,
      previewImage: '/default-theme.png',
      uploadBy: new mongoose.Types.ObjectId(), // Dummy user ID
      zipFile: {
        originalName: 'test-theme.zip',
        size: 1024000,
        uploadDate: new Date()
      },
      thumbnail: {
        filename: 'test-thumbnail.jpg',
        originalName: 'test-thumbnail.jpg',
        size: 50000,
        uploadDate: new Date()
      },
      directories: {
        thumbnail: '/uploads/themes/test-theme/thumbnail.jpg',
        code: '/uploads/themes/test-theme/code/',
        theme: '/uploads/themes/test-theme/'
      },
      themePath: '/uploads/themes/test-theme/',
      plan: 'free',
      installationCount: 0,
      status: 'active'
    });

    console.log('Test theme created:', testTheme);

    // Create a test store
    const testStore = await Store.create({
      storeName: 'Test Store',
      storeDescription: 'A test store for theme installation',
      subdomain: 'test-store',
      userId: new mongoose.Types.ObjectId(), // Dummy user ID
      status: 'active'
    });

    console.log('Test store created:', testStore);

    console.log('\n✅ Test data created successfully!');
    console.log('Theme ID:', testTheme._id);
    console.log('Store ID:', testStore._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

// Run the function
createTestTheme();
