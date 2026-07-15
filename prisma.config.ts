import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL no esta definida para Prisma");
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
  },
});
