import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import usersRoute from './routes/users';
import { connectDB, disconnectDB } from './config/database';

const app = express();

app.get('/', (_, res) => {
  res.send('Welcome to the PowerBag API');
});

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use('/users', usersRoute);

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server running on Port ${PORT}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('HTTP server closed');
        await disconnectDB();
        console.log('Graceful shutdown completed');
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('Forcing exit due to timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    await disconnectDB();
    process.exit(1);
  }
};

startServer();
