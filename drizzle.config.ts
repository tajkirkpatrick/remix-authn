import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/.server/schema.ts",
  dbCredentials: {
    url: "postgres://postgres:postgres@127.0.0.1:5432/postgres",
  },
});
