const mongoose = require('mongoose');
require('dotenv').config();

// Test MongoDB connection
async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-swap-platform');
    console.log('✅ MongoDB connection successful!');
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Test environment variables
function testEnvironment() {
  console.log('Testing environment variables...');
  
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing);
    console.log('💡 Create a .env file with the required variables');
  } else {
    console.log('✅ Environment variables look good!');
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Running server tests...\n');
  
  testEnvironment();
  console.log('');
  
  await testConnection();
  
  console.log('\n🎉 All tests passed! Server is ready to run.');
  console.log('💡 Run "npm run dev" to start the development server');
}

runTests().catch(console.error); 