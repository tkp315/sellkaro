import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  // Use a smaller pool in test to avoid hitting Supabase session-mode limit (15)
  const maxConnections = process.env.NODE_ENV === 'test' ? 3 : 10;
  const pool = new Pool({ connectionString, max: maxConnections });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

export default prisma;
