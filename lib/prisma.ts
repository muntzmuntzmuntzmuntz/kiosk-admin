import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { cache } from "react";

export const getDb = cache(() => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, maxUses: 1 }),
  });
});

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    return getDb()[property as keyof PrismaClient];
  },
});
