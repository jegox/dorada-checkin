import { defineConfig } from "prisma/config";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:ExlbuyAZpCppmYfuUPqbaBlladjBNqBP@metro.proxy.rlwy.net:11252/railway?schema=dorada";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
  },
});
