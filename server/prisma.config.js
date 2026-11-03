import "./prisma/load-env.js";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Read lazily rather than with env(): `prisma generate` (run on npm install)
    // must work before server/.env exists. Commands that talk to the database
    // (migrate, seed, studio) still report a missing DATABASE_URL.
    url: process.env.DATABASE_URL,
  },
});
