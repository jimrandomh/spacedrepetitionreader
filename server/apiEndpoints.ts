import type {Express} from 'express';
import {Prisma, PrismaClient} from '@prisma/client'

export function addApiEndpoints(app: Express) {
  app.get('/cards', async (req,res) => {
    res.json([]);
  });
}
