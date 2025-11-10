import { defineConfig } from "drizzle-kit";

// Allow running without DATABASE_URL for in-memory storage
// This config is only used when running drizzle-kit commands
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set. Database operations will be skipped.");
  console.warn("   To use PostgreSQL, set DATABASE_URL in .env");
  process.exit(0);
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
