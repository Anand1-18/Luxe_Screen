import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let client;

/** Lazily creates one shared Prisma client, so importing this module never needs a database. */
function getClient() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in.",
      );
    }
    client = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
      log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
    });
  }
  return client;
}

/** Proxy so services can write `prisma.booking.findMany()` while the client is created on first use. */
export const prisma = new Proxy(
  {},
  {
    get(_target, property) {
      const value = getClient()[property];
      return typeof value === "function" ? value.bind(getClient()) : value;
    },
  },
);

export async function disconnect() {
  if (client) await client.$disconnect();
}
