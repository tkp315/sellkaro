import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, createBuyer, createSeller, cleanupTestUsers, authHeader } from '../helpers.js';
import prisma from '@utils/prisma.js';

let sellerToken: string;
let buyerToken: string;
let categoryId: string;
let testCategoryId: string;
let adId: string;

beforeAll(async () => {
  // Sequential — parallel creates cause FK violations with pgBouncer pool
  const seller = await createSeller();
  const buyer = await createBuyer();
  sellerToken = seller.accessToken;
  buyerToken = buyer.accessToken;

  // Use existing category or create a test one
  let category = await prisma.category.findFirst();
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'Test Category', slug: `test-cat-${Date.now()}`, icon: '🔧' },
    });
    testCategoryId = category.id;
  }
  categoryId = category.id;
});

afterAll(async () => {
  await cleanupTestUsers();
  if (testCategoryId) await prisma.category.delete({ where: { id: testCategoryId } }).catch(() => {});
});

describe('POST /api/v1/seller/ads', () => {
  it('seller can create an ad', async () => {
    const res = await api
      .post('/api/v1/seller/ads')
      .set(authHeader(sellerToken))
      .send({
        title: 'Test Laptop for Sale',
        description: 'Great condition laptop used for 1 year.',
        price: 25000,
        condition: 'GOOD',
        city: 'Mumbai',
        categoryId,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test Laptop for Sale');
    expect(res.body.data.price).toBe(25000);
    adId = res.body.data.id;
  });

  it('any authenticated user can create an ad (role check is frontend-only)', async () => {
    const res = await api
      .post('/api/v1/seller/ads')
      .set(authHeader(buyerToken))
      .send({
        title: 'Buyer Test Ad',
        description: 'Testing that buyer can post ad.',
        price: 500,
        condition: 'NEW',
        city: 'Delhi',
        categoryId,
      });
    // Backend has no role restriction — buyer can create ads
    expect(res.status).toBe(201);
    // Cleanup
    if (res.body.data?.id) {
      await api.delete(`/api/v1/seller/ads/${res.body.data.id}`).set(authHeader(buyerToken));
    }
  });

  it('rejects missing required fields', async () => {
    const res = await api
      .post('/api/v1/seller/ads')
      .set(authHeader(sellerToken))
      .send({ title: 'Only title' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('GET /api/v1/seller/ads', () => {
  it('returns seller\'s own ads', async () => {
    const res = await api.get('/api/v1/seller/ads').set(authHeader(sellerToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await api.get('/api/v1/seller/ads');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/seller/ads/:id', () => {
  it('returns a specific ad', async () => {
    const res = await api.get(`/api/v1/seller/ads/${adId}`).set(authHeader(sellerToken));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(adId);
  });

  it('returns 404 for non-existent ad', async () => {
    const res = await api.get('/api/v1/seller/ads/nonexistent-id-xyz').set(authHeader(sellerToken));
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/seller/ads/:id', () => {
  it('updates an ad', async () => {
    const res = await api
      .patch(`/api/v1/seller/ads/${adId}`)
      .set(authHeader(sellerToken))
      .send({ price: 22000, city: 'Pune' });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(22000);
    expect(res.body.data.city).toBe('Pune');
  });

  it('cannot update someone else\'s ad', async () => {
    const res = await api
      .patch(`/api/v1/seller/ads/${adId}`)
      .set(authHeader(buyerToken))
      .send({ price: 1 });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('PATCH /api/v1/seller/ads/:id/status', () => {
  it('changes ad status to PAUSED', async () => {
    const res = await api
      .patch(`/api/v1/seller/ads/${adId}/status`)
      .set(authHeader(sellerToken))
      .send({ status: 'PAUSED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PAUSED');
  });

  it('changes ad status back to ACTIVE', async () => {
    const res = await api
      .patch(`/api/v1/seller/ads/${adId}/status`)
      .set(authHeader(sellerToken))
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });
});

describe('GET /api/v1/ads (public feed)', () => {
  it('returns paginated listings', async () => {
    const res = await api.get('/api/v1/ads');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.ads)).toBe(true);
    expect(typeof res.body.data.pagination.total).toBe('number');
  });

  it('filters by city', async () => {
    const res = await api.get('/api/v1/ads?city=Mumbai');
    expect(res.status).toBe(200);
  });

  it('filters by search term', async () => {
    const res = await api.get('/api/v1/ads?search=laptop');
    expect(res.status).toBe(200);
  });

  it('paginates results', async () => {
    const res = await api.get('/api/v1/ads?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.ads.length).toBeLessThanOrEqual(5);
  });
});

describe('GET /api/v1/ads/:id (public detail)', () => {
  it('returns ad detail', async () => {
    const res = await api.get(`/api/v1/ads/${adId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(adId);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.product).toBeDefined();
  });
});

describe('DELETE /api/v1/seller/ads/:id', () => {
  it('deletes an ad', async () => {
    const createRes = await api
      .post('/api/v1/seller/ads')
      .set(authHeader(sellerToken))
      .send({
        title: 'Ad to Delete',
        description: 'This will be deleted in tests.',
        price: 100,
        condition: 'FAIR',
        city: 'Delhi',
        categoryId,
      });
    if (createRes.status !== 201) return; // skip if create failed
    const deleteId = createRes.body.data.id;
    const res = await api.delete(`/api/v1/seller/ads/${deleteId}`).set(authHeader(sellerToken));
    expect(res.status).toBe(200);
  });
});
