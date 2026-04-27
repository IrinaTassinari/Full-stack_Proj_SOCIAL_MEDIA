import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('MONGO_URL is not defined in .env');
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error('MongoDB connection error:', message);
    process.exit(1);
  }
};






