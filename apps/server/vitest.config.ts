import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

// Parse .env.test at config time and inject into all workers via test.env
const { parsed: testEnv = {} } = dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  resolve: {
    alias: {
      '@config':      path.resolve(__dirname, 'src/config'),
      '@lib':         path.resolve(__dirname, 'src/lib'),
      '@modules':     path.resolve(__dirname, 'src/modules'),
      '@middlewares': path.resolve(__dirname, 'src/middlewares'),
      '@utils':       path.resolve(__dirname, 'src/utils'),
      '@globals':     path.resolve(__dirname, 'src/globals'),
      '@helpers':     path.resolve(__dirname, 'src/helpers'),
      '@jobs':        path.resolve(__dirname, 'src/jobs'),
      'globals':      path.resolve(__dirname, 'src/globals'),
    },
    extensions: ['.ts', '.mts', '.cts', '.tsx', '.js', '.mjs', '.cjs', '.jsx'],
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'threads',
    // Run files sequentially — avoids Supabase pooler saturation under concurrency
    poolOptions: {
      threads: { maxThreads: 1, minThreads: 1 },
    },
    // Inject all .env.test variables into every worker before any module loads
    env: { ...testEnv, NODE_ENV: 'test' },
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/modules/**/*.ts'],
      exclude: ['**/__tests__/**', '**/types/**', '**/validators/**'],
    },
  },
});
