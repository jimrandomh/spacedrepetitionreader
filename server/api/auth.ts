import type {Express} from 'express';
import type {PrismaClient, User} from '@prisma/client'
import * as ApiTypes from '../lib/apiTypes';
import {defineGetApi,definePostApi,ServerApiContext} from './serverApiUtil';
import {getPrisma} from './db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Cookies from 'universal-cookie';

const bcryptSaltRounds = 10;

function generateTokenString(): string {
  return crypto.randomBytes(20).toString('hex');
}

export async function getUserFromReq(req: Express.Request, db: PrismaClient): Promise<User|null> {
  const cookies = new Cookies((req as any).headers.cookie);
  const loginCookie = cookies.get('login')
  if (!loginCookie || !loginCookie.length) {
    return null;
  }
  
  const token = await db.loginToken.findUnique({
    where: {token:loginCookie},
    include: {owner: true}
  });
  if (!token) return null;
  if (!token.valid) return null;
  
  const user = token.owner;
  return user;
}

async function createAndAssignLoginToken(req: Express.Request, res: Express.Response, user: User, db: PrismaClient) {
  const token = generateTokenString();
  await db.loginToken.create({
    data: {
      token,
      createdAt: new Date(),
      ownerId: user.id,
      valid: true
    }
  });
  
  (res as any).cookie('login', token, {
    path: "/"
  });
}

export function addAuthEndpoints(app: Express) {
  definePostApi<ApiTypes.ApiSignup>(app, "/api/users/signup", async (ctx) => {
    const {username, email, password} = ctx.body;
    const passwordHash = await bcrypt.hash(password, bcryptSaltRounds);
    
    if (await ctx.db.user.findUnique({where: {name: username}})) {
      throw new Error("That username is taken");
    }
    if (await ctx.db.user.findUnique({where: {email}})) {
      throw new Error("That email address is taken");
    }
    
    const user = await ctx.db.user.create({
      data: {
        name: username,
        email, passwordHash,
      }
    });
    await createAndAssignLoginToken(ctx.req, ctx.res, user, ctx.db);
    
    return {};
  });
  definePostApi<ApiTypes.ApiLogin>(app, "/api/users/login", async (ctx) => {
    const {username,password} = ctx.body;
    
    const user = await ctx.db.user.findUnique({where: {name: username}});
    if (!user || !await bcrypt.compare(user.passwordHash, password)) {
      throw new Error("Incorrect username or password");
    }
    
    await createAndAssignLoginToken(ctx.req, ctx.res, user, ctx.db);
    return {};
  });
  definePostApi<ApiTypes.ApiLogout>(app, "/api/users/logout", async (ctx) => {
    const cookies = new Cookies((ctx.req as any).headers.cookie);
    const loginCookie = cookies.get('login')
    if (!loginCookie) {
      return {};
    }
    await ctx.db.loginToken.update({
      where: {token:loginCookie},
      data: {valid: false}
    });
    (ctx.res as any).cookie('login', '', {
      path: "/"
    });
    
    return {};
  });
  
  defineGetApi<ApiTypes.ApiWhoami>(app, "/api/users/whoami", async (ctx) => {
    return {
      currentUser: apiFilterCurrentUser(ctx.currentUser, ctx)
    };
  });
}

function apiFilterCurrentUser(user: User|null, ctx: ServerApiContext): ApiTypes.ApiObjCurrentUser|null {
  if (!user)
    return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}
