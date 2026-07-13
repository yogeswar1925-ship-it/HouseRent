const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentease';
    
    // Attempt standard connection
    console.log(`Connecting to database at ${uri}...`);
    // Set a short timeout so if it's not running, it fails quickly and starts in-memory
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB Connected successfully.');
  } catch (err) {
    console.log('Local MongoDB connection failed/timed out. Launching MongoDB In-Memory Server...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      console.log(`MongoDB Memory Server started at ${memoryUri}`);
      await mongoose.connect(memoryUri);
      console.log('Connected to MongoDB In-Memory Server.');
    } catch (memErr) {
      console.error('Failed to start MongoDB Memory Server:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
