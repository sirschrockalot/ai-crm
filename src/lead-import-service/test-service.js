const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/presidential_digs_crm';
  
  console.log('🔌 Testing MongoDB connection...');
  console.log(`URI: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log('✅ MongoDB connection successful!');
    
    // Test database access
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log(`📊 Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    await client.close();
    console.log('🔌 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function testService() {
  console.log('🧪 Testing Lead Import Service...');
  
  // Test MongoDB connection
  await testMongoConnection();
  
  console.log('✅ All tests passed!');
  console.log('🚀 Service is ready to start');
}

// Run tests
testService().catch(console.error);
