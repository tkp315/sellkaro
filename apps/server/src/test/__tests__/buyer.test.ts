import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, createBuyer, createSeller, cleanupTestUsers, authHeader } from '../helpers.js';
import prisma from '@utils/prisma.js';

let buyerToken: string;
let sellerToken: string;
let adId: string;
let chatId: string;
let testCategoryId: string;

beforeAll(async () => {
  // Sequential — parallel creates cause FK violations with pgBouncer pool
  const buyer = await createBuyer();
  const seller = await createSeller();
  buyerToken = buyer.accessToken;
  sellerToken = seller.accessToken;

  // Use existing category or create a test one
  let category = await prisma.category.findFirst();
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'Test Category', slug: `test-cat-${Date.now()}`, icon: '🛒' },
    });
    testCategoryId = category.id;
  }

  if (!category) throw new Error('No categories in DB');

  const adRes = await api
    .post('/api/v1/seller/ads')
    .set(authHeader(sellerToken))
    .send({
      title: 'Buyer Test Ad',
      description: 'Used for buyer feature tests only.',
      price: 5000,
      condition: 'GOOD',
      city: 'Bangalore',
      categoryId: category.id,
    });
  adId = adRes.body.data.id;
});

afterAll(async () => {
  await cleanupTestUsers();
  if (testCategoryId) await prisma.category.delete({ where: { id: testCategoryId } }).catch(() => {});
});

// ─── Wishlist ──────────────────────────────────────────────────────────────────

describe('Wishlist', () => {
  it('adds ad to wishlist', async () => {
    const res = await api
      .post(`/api/v1/buyer/wishlist/${adId}`)
      .set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(res.body.data.saved).toBe(true);
  });

  it('returns wishlist with the saved ad', async () => {
    const res = await api.get('/api/v1/buyer/wishlist').set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((a: { id: string }) => a.id === adId)).toBe(true);
  });

  it('returns wishlist ids', async () => {
    const res = await api.get('/api/v1/buyer/wishlist/ids').set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toContain(adId);
  });

  it('toggles ad off wishlist', async () => {
    const res = await api
      .post(`/api/v1/buyer/wishlist/${adId}`)
      .set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(res.body.data.saved).toBe(false);
  });

  it('returns 401 without token', async () => {
    const res = await api.get('/api/v1/buyer/wishlist');
    expect(res.status).toBe(401);
  });
});

// ─── Cart ──────────────────────────────────────────────────────────────────────

describe('Cart', () => {
  it('adds ad to cart', async () => {
    const res = await api
      .post(`/api/v1/buyer/cart/${adId}`)
      .set(authHeader(buyerToken));
    expect(res.status).toBe(200);
  });

  it('returns cart with added item', async () => {
    const res = await api.get('/api/v1/buyer/cart').set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.some((item: { ad: { id: string } }) => item.ad.id === adId)).toBe(true);
  });

  it('returns cart item count', async () => {
    const res = await api.get('/api/v1/buyer/cart/count').set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBeGreaterThan(0);
  });

  it('removes ad from cart', async () => {
    const res = await api
      .delete(`/api/v1/buyer/cart/${adId}`)
      .set(authHeader(buyerToken));
    expect(res.status).toBe(200);
  });

  it('clears cart', async () => {
    // add back first
    await api.post(`/api/v1/buyer/cart/${adId}`).set(authHeader(buyerToken));
    const res = await api.delete('/api/v1/buyer/cart/clear').set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(res.body.data.cleared).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await api.get('/api/v1/buyer/cart');
    expect(res.status).toBe(401);
  });
});

// ─── Chat ──────────────────────────────────────────────────────────────────────

describe('Chat', () => {
  it('starts a chat with seller', async () => {
    const res = await api
      .post(`/api/v1/buyer/chats/ad/${adId}`)
      .set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBeTruthy();
    chatId = res.body.data.id;
  });

  it('returns same chat on second start (idempotent)', async () => {
    const res = await api
      .post(`/api/v1/buyer/chats/ad/${adId}`)
      .set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(chatId);
  });

  it('returns chat inbox', async () => {
    const res = await api.get('/api/v1/buyer/chats').set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((c: { id: string }) => c.id === chatId)).toBe(true);
  });

  it('sends a message', async () => {
    const res = await api
      .post(`/api/v1/buyer/chats/${chatId}/messages`)
      .set(authHeader(buyerToken))
      .send({ content: 'Is this still available?' });
    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Is this still available?');
  });

  it('returns messages for a chat', async () => {
    const res = await api
      .get(`/api/v1/buyer/chats/${chatId}`)
      .set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.messages)).toBe(true);
    expect(res.body.data.messages.length).toBeGreaterThan(0);
  });

  it('seller can also see the chat', async () => {
    const res = await api
      .get(`/api/v1/buyer/chats/${chatId}`)
      .set(authHeader(sellerToken));
    expect(res.status).toBe(200);
  });

  it('returns 401 without token', async () => {
    const res = await api.get('/api/v1/buyer/chats');
    expect(res.status).toBe(401);
  });
});

// ─── Notifications ─────────────────────────────────────────────────────────────

describe('Notifications', () => {
  it('returns notification list', async () => {
    const res = await api.get('/api/v1/notifications').set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
  });

  it('returns unread count', async () => {
    const res = await api.get('/api/v1/notifications/unread').set(authHeader(buyerToken));
    expect(res.status).toBe(200);
    expect(typeof res.body.data.count).toBe('number');
  });

  it('marks all as read', async () => {
    const res = await api.patch('/api/v1/notifications/read-all').set(authHeader(buyerToken));
    expect(res.status).toBe(200);
  });

  it('returns 401 without token', async () => {
    const res = await api.get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });
});
