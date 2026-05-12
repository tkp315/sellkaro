import { init, app } from './app.js';
import { createServer } from 'node:http';
import SK from './globals/index.js';

async function startServer() {
  try {
    await init();

    const env = SK.config.app as Record<string, unknown>;
    const envVars = env['env'] as Record<string, unknown>;
    const port = Number(envVars['PORT']) || 5000;
    const nodeEnv = String(envVars['NODE_ENV'] ?? 'development');

    const server = createServer(app);
    server.listen(port, () => {
      console.log(`🚀 [${nodeEnv}] Server running on port ${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
