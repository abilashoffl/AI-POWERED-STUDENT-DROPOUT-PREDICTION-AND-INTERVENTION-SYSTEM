const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_dropout_db';
    
    // Attempt standard connection first with 3 second timeout
    mongoose.set('strictQuery', false);
    
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`[MongoDB] Connected successfully to target URI: ${conn.connection.host}`);
      return conn;
    } catch (primaryErr) {
      console.warn(`[MongoDB] Could not connect to primary MongoDB at ${mongoUri}. Initializing embedded MongoDB Memory Server...`);
      
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      
      const memoryConn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB Memory Server] Connected successfully to in-memory database: ${memoryUri}`);
      return memoryConn;
    }
  } catch (err) {
    console.error(`[MongoDB Error] Failed to establish database connection: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
