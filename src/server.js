import app from './app.js';
import { connectMongo } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  fs.appendFileSync('logs/errors.log', `[Uncaught Exception] ${err.stack}\n`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  fs.appendFileSync('logs/errors.log', `[Unhandled Rejection] ${reason.stack || reason}\n`);
});


const startServer = async () => {
  try {

    await connectMongo();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

startServer();
