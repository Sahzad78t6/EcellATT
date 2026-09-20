import app from './app.js';
import { connectDB } from './config/db.js';
import { startEventScheduler } from './jobs/eventScheduler.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();

    // Start background event scheduler cron job
    startEventScheduler();

    const server = app.listen(ENV.PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 E-Cell Attendance Portal Server`);
      console.log(`📡 Listening on: http://localhost:${ENV.PORT}`);
      console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
      console.log(`🕒 Timezone: ${ENV.TIMEZONE}`);
      console.log(`✉️ Email Service: ${ENV.EMAIL_ENABLED ? 'SMTP Enabled' : 'Console Simulator Mode'}`);
      console.log(`====================================================`);
    });

    // Graceful shutdown
    const handleShutdown = () => {
      console.log('\nReceived kill signal, shutting down gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
