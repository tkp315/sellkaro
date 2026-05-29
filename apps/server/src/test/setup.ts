import { initTestApp } from './testApp.js';
import prisma from '@utils/prisma.js';

beforeAll(async () => {
  await initTestApp();
}, 30000);

// Release pg connections after each test file so sequential files don't hit the pool limit
afterAll(async () => {
  await prisma.$disconnect();
});
