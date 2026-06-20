import mongoose from "mongoose";

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`✗ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

export default connectDB;
