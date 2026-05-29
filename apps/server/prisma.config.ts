import { defineConfig } from "prisma/config";
import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env['DATABASE_URL']!,
  },
});
