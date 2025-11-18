import { defineConfig } from "drizzle-kit";

// Database configuration is not currently supported; the application always uses in-memory storage.
// This config is only used when running drizzle-kit commands
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL not set. Database persistence is not yet implemented.\n" +
    "The application currently only supports in-memory storage."
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
