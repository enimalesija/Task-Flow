import mongoose from 'mongoose';
import app from './index';

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI!;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  }
}

start();
