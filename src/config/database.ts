import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

export let prisma: PrismaClient;
export function connectDb(): void {
  prisma = new PrismaClient();
}

export async function disconnectDB(): Promise<void> {
  await prisma?.$disconnect();
}

const redis = createClient({
  url: process.env.REDIS_URL
});
redis.on("error", (err) => console.error(err));
redis.connect();

export { redis };
