import { init, app } from './app.js';
import { createServer } from 'node:http';
import SK from './globals/index.js';
import { initSocket } from './lib/services/socket/index.js';
import prisma from './utils/prisma.js';

// ─── Ad Expiry Cron ───────────────────────────────────────────────────────────
function startExpiryCron() {
  const ONE_HOUR = 60 * 60 * 1000;

  const run = async () => {
    try {
      const result = await prisma.sellerAd.updateMany({
        where: {
          status: { in: ['ACTIVE', 'PAUSED'] },
          expiresAt: { lt: new Date() },
        },
        data: { status: 'EXPIRED' },
      });
      if (result.count > 0) console.log(`⏰ Expired ${result.count} ads`);
    } catch (e) {
      console.error('Ad expiry cron error:', e);
    }
  };

  void run(); // run once on startup
  setInterval(run, ONE_HOUR);
}

async function startServer() {
  try {
    await init();

    const env = SK.config.app as Record<string, unknown>;
    const envVars = env['env'] as Record<string, unknown>;
    const port = Number(envVars['PORT']) || 5000;
    const nodeEnv = String(envVars['NODE_ENV'] ?? 'development');

    const server = createServer(app);

    // Socket.io
    initSocket(server);
    console.log('🔌 Socket.io initialized');

    // Ad expiry cron
    startExpiryCron();

    server.listen(port, () => {
      console.log(`🚀 [${nodeEnv}] Server running on port ${port}`);
    });

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
