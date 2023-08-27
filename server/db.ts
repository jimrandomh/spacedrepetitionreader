import {PrismaClient} from '@prisma/client'

let prisma: PrismaClient|null = null;

export function getPrisma(): PrismaClient {
  if (prisma)
    return prisma;
  
  prisma = new PrismaClient({
    // Uncomment to look every SQL query
    //log: ["query", "info", "warn", "error"],
  })
  if (!prisma) throw new Error("Unable to initialize prisma");
  return prisma;
}
