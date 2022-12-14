import {Prisma, PrismaClient} from '@prisma/client'

let prisma: PrismaClient|null = null;

export function getPrisma(): PrismaClient {
  if (prisma)
    return prisma;
  
  prisma = new PrismaClient()
  if (!prisma) throw new Error("Unable to initialize prisma");
  return prisma;
}
