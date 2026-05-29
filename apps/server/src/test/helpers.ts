import request from 'supertest';
import testApp from './testApp.js';
import prisma from '@utils/prisma.js';

export const TEST_TAG = '__autotest__';

// ─── User factories ────────────────────────────────────────────────────────────

export function uniqueEmail(role = 'buyer') {
  return `${TEST_TAG}${role}_${Date.now()}_${Math.random().toString(36).slice(2)}@test.olx`;
}

export interface TestCreds {
  email: string;
  password: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
}

async function register(
  email: string,
  password: string,
  role: 'BUYER' | 'SELLER' = 'BUYER',
  attempts = 3,
): Promise<TestCreds> {
  for (let i = 0; i < attempts; i++) {
    // Clean any partial user from a previous failed attempt
    if (i > 0) {
      await prisma.user.deleteMany({ where: { email } });
      await new Promise((r) => setTimeout(r, 300 * i));
    }

    const res = await request(testApp)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email, password, role });

    if (res.status === 201) {
      return {
        email,
        password,
        userId: res.body.data.user.id,
        accessToken: res.body.data.tokens.accessToken,
        refreshToken: res.body.data.tokens.refreshToken,
      };
    }
  }
  throw new Error(`Register failed after ${attempts} attempts for ${email}`);
}

export async function createBuyer(): Promise<TestCreds> {
  return register(uniqueEmail('buyer'), 'TestPass123!', 'BUYER');
}

export async function createSeller(): Promise<TestCreds> {
  return register(uniqueEmail('seller'), 'TestPass123!', 'SELLER');
}

export async function createAdmin(): Promise<TestCreds> {
  // ADMIN_EMAIL from .env.test auto-promotes to ADMIN on register
  const email = process.env.ADMIN_EMAIL ?? 'admin.autotest@test.olx';
  // Delete AdminLog entries first, then the user
  await prisma.adminLog.deleteMany({ where: { admin: { email } } }).catch(() => {});
  await prisma.user.deleteMany({ where: { email } });
  return register(email, 'AdminPass123!', 'BUYER');
}

// ─── Request helpers ───────────────────────────────────────────────────────────

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const api = request(testApp);

// ─── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanupTestUsers() {
  // Delete AdminLog entries first (FK: AdminLog.adminId → User.id)
  await prisma.adminLog
    .deleteMany({ where: { admin: { email: { contains: TEST_TAG } } } })
    .catch(() => {});
  await prisma.user.deleteMany({ where: { email: { contains: TEST_TAG } } });
}

export async function cleanupAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'admin.autotest@test.olx';
  // Delete AdminLog entries first (from previous test runs)
  await prisma.adminLog.deleteMany({ where: { admin: { email } } }).catch(() => {});
  await prisma.user.deleteMany({ where: { email } });
}
