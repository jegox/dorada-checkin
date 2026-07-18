import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let activeConnectionString: string | undefined;

function getConnectionString() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error("DATABASE_URL no está definida");
  }

  return value;
}

function getSchemaFromConnectionString(connectionString: string) {
  try {
    const parsed = new URL(connectionString);
    const schema = parsed.searchParams.get("schema")?.trim();
    return schema || "public";
  } catch {
    return "public";
  }
}

function createPrismaClient(connectionString: string) {
  const schema = getSchemaFromConnectionString(connectionString);
  const adapter = new PrismaPg({ connectionString }, { schema });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrismaClient() {
  const connectionString = getConnectionString();

  if (globalForPrisma.prisma && activeConnectionString === connectionString) {
    return globalForPrisma.prisma;
  }

  if (globalForPrisma.prisma && activeConnectionString !== connectionString) {
    void globalForPrisma.prisma.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient(connectionString);
  globalForPrisma.prisma = client;
  activeConnectionString = connectionString;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, prop, receiver);

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});
