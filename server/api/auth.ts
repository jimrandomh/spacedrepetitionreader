import type {Express,Request,Response} from 'express';
import type {PrismaClient, User} from '@prisma/client'
import {defineGetApi,definePostApi,ServerApiContext,assertIsString} from '../serverApiUtil';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Cookies from 'universal-cookie';

const bcryptSaltRounds = 10;

function generateTokenString(): string {
  return crypto.randomBytes(20).toString('hex');
}

export async function getUserFromReq(req: Request, db: PrismaClient): Promise<User|null> {
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

async function createAndAssignLoginToken(req: Request, res: Response, user: User, db: PrismaClient) {
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
    const username = assertIsString(ctx.body.username);
    const email = assertIsString(ctx.body.email);
    const password = assertIsString(ctx.body.password);
    
    if (username === "")
      throw new Error("Please provide a username");
    if (email === "")
      throw new Error("Please provide an email address");
    if (password === "")
      throw new Error("Please choose a password");
    
    if (await ctx.db.user.findUnique({where: {name: username}})) {
      throw new Error("That username is taken");
    }
    if (await ctx.db.user.findUnique({where: {email}})) {
      throw new Error("That email address is taken");
    }
    
    const passwordHash = await bcrypt.hash(password, bcryptSaltRounds);
    const user = await ctx.db.user.create({
      data: {
        name: username,
        email, passwordHash,
      }
    });
    
    if (ctx.req && ctx.res) {
      await createAndAssignLoginToken(ctx.req, ctx.res, user, ctx.db);
    }
    
    return {};
  });
  definePostApi<ApiTypes.ApiLogin>(app, "/api/users/login", async (ctx) => {
    const username = assertIsString(ctx.body.username);
    const password = assertIsString(ctx.body.password);
    
    const user = await ctx.db.user.findUnique({where: {name: username}});
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      if (!user) console.log(`No such user: ${username}`);
      console.log(`Password ${password} did not match hash ${user?.passwordHash}`);
      throw new Error("Incorrect username or password");
    }
    
    if (ctx.req && ctx.res) {
      await createAndAssignLoginToken(ctx.req, ctx.res, user, ctx.db);
    }
    
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

function apiFilterCurrentUser(user: User|null, _ctx: ServerApiContext): ApiTypes.ApiObjCurrentUser|null {
  if (!user)
    return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}
