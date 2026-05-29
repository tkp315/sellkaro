import { describe, it, expect, afterAll } from 'vitest';
import { api, createBuyer, uniqueEmail, cleanupTestUsers } from '../helpers.js';

afterAll(cleanupTestUsers);

describe('POST /api/v1/auth/register', () => {
  it('creates a new BUYER user and returns tokens', async () => {
    const email = uniqueEmail();
    const res = await api.post('/api/v1/auth/register').send({
      name: 'Test Buyer',
      email,
      password: 'TestPass123!',
      role: 'BUYER',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.role).toBe('BUYER');
    expect(res.body.data.tokens.accessToken).toBeTruthy();
  });

  it('creates a new SELLER user', async () => {
    const res = await api.post('/api/v1/auth/register').send({
      name: 'Test Seller',
      email: uniqueEmail('seller'),
      password: 'TestPass123!',
      role: 'SELLER',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('SELLER');
  });

  it('rejects duplicate email', async () => {
    const email = uniqueEmail('dup');
    await api.post('/api/v1/auth/register').send({ name: 'Test User One', email, password: 'Pass1234!' });
    const res = await api.post('/api/v1/auth/register').send({ name: 'Test User Two', email, password: 'Pass1234!' });
    expect(res.status).toBe(409);
  });

  it('rejects short password', async () => {
    const res = await api.post('/api/v1/auth/register').send({
      name: 'Test',
      email: uniqueEmail(),
      password: '123',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects missing email', async () => {
    const res = await api.post('/api/v1/auth/register').send({ name: 'Test', password: 'Pass1234!' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    const { email, password } = await createBuyer();
    const res = await api.post('/api/v1/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeTruthy();
    expect(res.body.data.user.email).toBe(email);
  });

  it('rejects wrong password', async () => {
    const { email } = await createBuyer();
    const res = await api.post('/api/v1/auth/login').send({ email, password: 'WrongPass999!' });
    expect(res.status).toBe(401);
  });

  it('rejects non-existent email', async () => {
    const res = await api.post('/api/v1/auth/login').send({
      email: 'nobody_exists@test.olx',
      password: 'Pass1234!',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/profile', () => {
  it('returns user profile when authenticated', async () => {
    const { email, accessToken } = await createBuyer();
    const res = await api
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
  });

  it('returns 401 without token', async () => {
    const res = await api.get('/api/v1/auth/profile');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await api
      .get('/api/v1/auth/profile')
      .set('Authorization', 'Bearer this.is.invalid');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('logs out successfully', async () => {
    const { accessToken, refreshToken } = await createBuyer();
    const res = await api
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/v1/auth/forgot-password', () => {
  it('returns 200 even for non-existent email (no info leak)', async () => {
    const res = await api
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'noexist@test.olx' });
    // Always 200 so attacker can't enumerate emails
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await api
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'not-an-email' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
