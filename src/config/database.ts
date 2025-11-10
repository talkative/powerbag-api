import mongoose from 'mongoose';
import { initializeDefaultSettings } from '../handlers/settings';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/powerbag';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');

    initializeDefaultSettings();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};
