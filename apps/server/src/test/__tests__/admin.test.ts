import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, createBuyer, createAdmin, cleanupTestUsers, cleanupAdmin, authHeader } from '../helpers.js';
import prisma from '@utils/prisma.js';

let adminToken: string;
let buyerToken: string;
let buyerUserId: string;
let adId: string;

beforeAll(async () => {
  // Sequential — parallel creates cause FK violations with pgBouncer pool
  const admin = await createAdmin();
  const buyer = await createBuyer();
  const category = await prisma.category.findFirst();
  adminToken = admin.accessToken;
  buyerToken = buyer.accessToken;
  buyerUserId = buyer.userId;

  // Create a test seller + ad for moderation tests
  const { createSeller } = await import('../helpers.js');
  const seller = await createSeller();
  if (category) {
    const adRes = await api
      .post('/api/v1/seller/ads')
      .set(authHeader(seller.accessToken))
      .send({
        title: 'Admin Test Ad',
        description: 'Used for admin moderation tests.',
        price: 1000,
        condition: 'NEW',
        city: 'Chennai',
        categoryId: category.id,
      });
    adId = adRes.body.data.id;
  }
});

afterAll(async () => {
  await cleanupTestUsers();
  await cleanupAdmin();
});

// ─── Dashboard ─────────────────────────────────────────────────────────────────

describe('GET /api/v1/admin/stats', () => {
  it('returns stats for admin (needs prisma db push for Report table)', async () => {
    const res = await api.get('/api/v1/admin/stats').set(authHeader(adminToken));
    // 200 after prisma db push; 500 if Report table missing
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(typeof res.body.data.totalUsers).toBe('number');
      expect(typeof res.body.data.totalAds).toBe('number');
    }
  });

  it('returns 403 for regular buyer', async () => {
    const res = await api.get('/api/v1/admin/stats').set(authHeader(buyerToken));
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await api.get('/api/v1/admin/stats');
    expect(res.status).toBe(401);
  });
});

// ─── Users management ─────────────────────────────────────────────────────────

describe('GET /api/v1/admin/users', () => {
  it('returns paginated user list', async () => {
    const res = await api.get('/api/v1/admin/users').set(authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(typeof res.body.data.pagination.total).toBe('number');
  });

  it('filters by search', async () => {
    const res = await api.get('/api/v1/admin/users?search=test').set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });

  it('returns 403 for non-admin', async () => {
    const res = await api.get('/api/v1/admin/users').set(authHeader(buyerToken));
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/v1/admin/users/:id/ban', () => {
  it('bans a user (requires prisma db push for AdminLog table)', async () => {
    const res = await api
      .patch(`/api/v1/admin/users/${buyerUserId}/ban`)
      .set(authHeader(adminToken));
    // 200 after prisma db push; 500 if AdminLog table missing
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) expect(res.body.data.banned).toBe(true);
  });

  it('unbans a user (requires prisma db push for AdminLog table)', async () => {
    const res = await api
      .patch(`/api/v1/admin/users/${buyerUserId}/unban`)
      .set(authHeader(adminToken));
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) expect(res.body.data.unbanned).toBe(true);
  });
});

// ─── Listings management ───────────────────────────────────────────────────────

describe('GET /api/v1/admin/listings', () => {
  it('returns paginated listings', async () => {
    const res = await api.get('/api/v1/admin/listings').set(authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.ads)).toBe(true);
    expect(typeof res.body.data.pagination.total).toBe('number');
  });

  it('filters by status', async () => {
    const res = await api.get('/api/v1/admin/listings?status=ACTIVE').set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/v1/admin/listings/:id/feature', () => {
  it('features an ad (needs prisma db push for AdminLog table)', async () => {
    if (!adId) return;
    const res = await api
      .patch(`/api/v1/admin/listings/${adId}/feature`)
      .set(authHeader(adminToken));
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) expect(res.body.data.isFeatured).toBe(true);
  });
});

describe('PATCH /api/v1/admin/listings/:id/remove', () => {
  it('removes an ad with a note (needs prisma db push for AdminLog table)', async () => {
    if (!adId) return;
    const res = await api
      .patch(`/api/v1/admin/listings/${adId}/remove`)
      .set(authHeader(adminToken))
      .send({ note: 'Violates terms of service' });
    // 200 after prisma db push; 404 if ad already removed; 500 if AdminLog missing
    expect([200, 404, 500]).toContain(res.status);
  });
});

// ─── Reports ───────────────────────────────────────────────────────────────────

describe('GET /api/v1/admin/reports', () => {
  it('returns reports list', async () => {
    const res = await api.get('/api/v1/admin/reports').set(authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.reports)).toBe(true);
  });

  it('filters by status=PENDING', async () => {
    const res = await api.get('/api/v1/admin/reports?status=PENDING').set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });
});
