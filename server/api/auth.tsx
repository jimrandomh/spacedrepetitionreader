import React from 'react';
import type {Express,Request,Response} from 'express';
import type {PrismaClient, User} from '@prisma/client'
import {defineGetApi,definePostApi,ServerApiContext,assertIsString, ApiErrorNotFound, ApiErrorAccessDenied} from '../serverApiUtil';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Cookies from 'universal-cookie';
import { sendEmail } from '../email';
import { getConfig } from '../getConfig';
import { getUserOptions } from '../../lib/userOptions';

const bcryptSaltRounds = 10;

function generateTokenString(): string {
  return crypto.randomBytes(20).toString('hex');
}

function hashForTokens(token: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(token);
  return hash.digest('hex');
}


export async function getUserFromReq(req: Request, db: PrismaClient): Promise<User|null> {
  const cookies = new Cookies((req as any).headers.cookie);
  const loginCookie = cookies.get('login')
  if (!loginCookie || !loginCookie.length) {
    return null;
  }
  
  const tokenHash = hashForTokens(loginCookie);
  const tokenObj = await db.loginToken.findUnique({
    where: {tokenHash},
    include: {owner: true}
  });
  if (!tokenObj) return null;
  if (!tokenObj.valid) return null;
  
  const user = tokenObj.owner;
  return user;
}

async function createAndAssignLoginToken(req: Request, res: Response, user: User, db: PrismaClient) {
  const token = generateTokenString();
  const tokenHash = hashForTokens(token);

  await db.loginToken.create({
    data: {
      tokenHash,
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
        isAdmin: false,
        config: {},
      }
    });
    
    if (ctx.req && ctx.res) {
      await createAndAssignLoginToken(ctx.req, ctx.res, user, ctx.db);
    }
    
    await sendConfirmationEmail(ctx, user);
    
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
    const tokenHash = hashForTokens(loginCookie);

    if (!loginCookie) {
      return {};
    }
    await ctx.db.loginToken.update({
      where: {tokenHash: tokenHash},
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
  
  definePostApi<ApiTypes.ApiRequestPasswordResetEmail>(app, "/api/users/requestPasswordReset", async (ctx) => {
    const email = assertIsString(ctx.body.email);
    const user = await ctx.db.user.findUnique({
      where: {email}
    });
    if (user) {
      await sendPasswordResetEmail(ctx, user);
    } else {
      throw new ApiErrorNotFound;
    }
    return {};
  });
  
  definePostApi<ApiTypes.ApiResetPassword>(app, "/api/users/resetPassword", async (ctx) => {
    const tokenStr = assertIsString(ctx.body.token);
    const newPassword = assertIsString(ctx.body.password);
    const tokenHash = hashForTokens(tokenStr);
    const newPasswordHash = await bcrypt.hash(newPassword, bcryptSaltRounds);

    const dbToken = await ctx.db.emailToken.findFirst({
      where: {
        type: "resetPassword",
        tokenHash,
        usedAt: null,
      },
    });
    if (!dbToken) {
      throw new ApiErrorAccessDenied;
    }
    
    await ctx.db.emailToken.update({
      where: {id: dbToken.id},
      data: {
        usedAt: new Date(),
      }
    });
    
    const user = await ctx.db.user.update({
      where: {id: dbToken.userId},
      data: {
        passwordHash: newPasswordHash,
      }
    });

    if (ctx.req && ctx.res) {
      await createAndAssignLoginToken(ctx.req, ctx.res, user, ctx.db);
    }
    return {};
  });
  
  definePostApi<ApiTypes.ApiConfirmEmail>(app, "/api/users/confirmEmail", async (ctx) => {
    const token = assertIsString(ctx.body.token);
    const tokenHash = hashForTokens(token);
    
    const dbToken = await ctx.db.emailToken.findFirst({
      where: {
        type: "confirmEmail",
        tokenHash,
        usedAt: null,
      }
    });
    if (!dbToken) {
      throw new ApiErrorNotFound;
    }
    
    await ctx.db.emailToken.update({
      where: { id: dbToken.id },
      data: { usedAt: new Date() },
    });
    await ctx.db.user.update({
      where: { id: dbToken.userId },
      data: { emailVerified: true },
    });
    
    return {};
  });
}

function apiFilterCurrentUser(user: User|null, _ctx: ServerApiContext): ApiTypes.ApiObjCurrentUser|null {
  if (!user)
    return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    config: getUserOptions(user),
  }
}


async function sendConfirmationEmail(ctx: ServerApiContext, user: User) {
  const config = getConfig();
  const token = generateTokenString();
  const tokenHash = hashForTokens(token);
  
  await ctx.db.emailToken.create({
    data: {
      type: "confirmEmail",
      tokenHash,
      userId: user.id,
    },
  });
  
  const confirmLink = `${config.siteUrl}/email/confirm/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Confirm your email address",
    body: <div>
      <p>Click this link to confirm your email address:</p>
      <p><a href={confirmLink}>Confirm</a></p>
    </div>,
    user,
  });
}

async function sendPasswordResetEmail(ctx: ServerApiContext, user: User) {
  const config = getConfig();
  const token = generateTokenString();
  const tokenHash = hashForTokens(token)
  
  await ctx.db.emailToken.create({
    data: {
      type: "resetPassword",
      tokenHash,
      userId: user.id,
    },
  });
  
  const resetPasswordLink = `${config.siteUrl}/email/resetPassword/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    body: <div>
      <p>Click this link to reset your password:</p>
      <p><a href={resetPasswordLink}>Reset password</a></p>
    </div>,
    user,
  });
}
