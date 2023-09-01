import React from 'react';
import type {Express,Request,Response} from 'express';
import type {PrismaClient, User} from '@prisma/client'
import { defineGetApi, definePostApi, ServerApiContext, assertIsString, ApiErrorNotFound, ApiErrorAccessDenied, assertLoggedIn, getCookie, setCookie } from '../serverApiUtil';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../email';
import { getConfig } from '../util/getConfig';
import { getUserOptions } from '../../lib/userOptions';
import fetch from 'node-fetch';
import { getPrisma } from '../db';
import { ConfirmYourAddressEmail, PasswordResetEmail } from '../../components/emails';

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
  const loginCookie = getCookie(req, "login");
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
  
  setCookie(res, 'login', token, {
    path: "/"
  });
}

async function logUserOut(user: User, db: PrismaClient, res: Response|null) {
  await db.loginToken.updateMany({
    where: {ownerId: user.id},
    data: {valid: false}
  });
  if (res) {
    setCookie(res, 'login', '', {
      path: "/"
    });
  }
}

export function addAuthEndpoints(app: Express) {
  definePostApi<ApiTypes.ApiSignup>(app, "/api/users/signup", async (ctx) => {
    const username = assertIsString(ctx.body.username);
    const email = assertIsString(ctx.body.email);
    const password = assertIsString(ctx.body.password);
    const timezone = assertIsString(ctx.body.timezone);
    
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
        config: {
          timezone
        },
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
    if (user && !user.passwordHash) {
      throw new Error("Account uses OAuth login");
    }
    if (!user || !await bcrypt.compare(password, user.passwordHash!)) {
      if (user) {
        console.log(`Incorrect password for user ${user.name}`);
      } else {
        console.log(`No such user: ${username}`);
      }
      throw new Error("Incorrect username or password");
    }
    
    if (ctx.req && ctx.res) {
      await createAndAssignLoginToken(ctx.req, ctx.res, user, ctx.db);
    }
    
    return {};
  });

  definePostApi<ApiTypes.ApiLogout>(app, "/api/users/logout", async (ctx) => {
    const currentUser = assertLoggedIn(ctx);
    await logUserOut(currentUser, ctx.db, ctx.res);
    return {};
  });
  
  defineGetApi<ApiTypes.ApiWhoami>(app, "/api/users/whoami", async (ctx) => {
    return {
      currentUser: apiFilterCurrentUser(ctx.currentUser)
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
  
  definePostApi<ApiTypes.ApiChangePassword>(app, "/api/users/changePassword", async (ctx) => {
    const user = assertLoggedIn(ctx);
    const oldPassword = assertIsString(ctx.body.oldPassword);
    const newPassword = assertIsString(ctx.body.newPassword);
    
    if (user.passwordHash && !await bcrypt.compare(oldPassword, user.passwordHash)) {
      throw ApiErrorAccessDenied;
    }
    
    const newPasswordHash = await bcrypt.hash(newPassword, bcryptSaltRounds);
    await ctx.db.user.update({
      where: {id: user.id},
      data: {passwordHash: newPasswordHash},
    });
    await logUserOut(user, ctx.db, ctx.res);
    
    return {};
  });

  app.get("/auth/google/login", (req, res) => {
    // Google OAuth, first step. The "log in with Google" link goes here; it
    // constructs a more complicated URL on accounts.google.com and redirects
    // there. Google displays an account-selection, then redirects back to
    // /auth/google.

    const googleOauthConfig = getConfig()?.oauth?.google;
    if (!googleOauthConfig) {
      throw new ApiErrorNotFound();
    }
    const redirect_url = `${getConfig().siteUrl}/auth/google`;
    const options = {
      redirect_uri: redirect_url,
      client_id: googleOauthConfig.clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };
    
    const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(options).toString()}`
    res.redirect(targetUrl);
  });
  app.get("/auth/google", async (req, res) => {
    // Google OAuth, second step. Google redirets back to here, with some query
    // parameters including a code. We use the code to get the user profile
    // from googleapis.com, match it to an account, and log in.

    const googleOauthConfig = getConfig()?.oauth?.google;
    if (!googleOauthConfig) {
      throw new ApiErrorNotFound();
    }

    const code: string = req.query.code as string;
    const redirect_uri = getConfig().siteUrl + '/auth/google';
    
    const options = {
      code,
      client_id: googleOauthConfig.clientId,
      client_secret: googleOauthConfig.clientSecret,
      redirect_uri,
      grant_type: 'authorization_code',
    };
    const url = `https://oauth2.googleapis.com/token`;
    const fetchResult = await fetch(url, {
      method: "POST",
      body: JSON.stringify(options),
    });
    
    const resultJson = await fetchResult.json() as GoogleOAuthResponse;
    
    const googleUser = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${resultJson.access_token}`, {
      headers: {
        Authorization: `Bearer ${resultJson.id_token}`
      }
    });
    
    const googleUserResult: GoogleOAuthProfile = await googleUser.json() as GoogleOAuthProfile;

    const db = getPrisma();
    const user = await db.user.findUnique({
      where: {
        email: googleUserResult.email
      },
    });
    if (!user) {
      // No corresponding account. Create one, and log in as it.
      const newUser = await db.user.create({
        data: {
          email: googleUserResult.email,
          name: `${googleUserResult.given_name}_${googleUserResult.family_name}`,
          config: {},
          passwordHash: null,
        },
      });
      await createAndAssignLoginToken(req, res, newUser, db);
      res.redirect("/first-oauth-login");
    } else {
      await createAndAssignLoginToken(req, res, user, db);
      res.redirect("/dashboard");
    }
  });
}

export function apiFilterCurrentUser(user: User|null): ApiTypes.ApiObjCurrentUser|null {
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
    user,
    subject: "Confirm your email address",
    allowUnverified: true,
    body: <ConfirmYourAddressEmail confirmLink={confirmLink}/>,
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
    user,
    subject: "Reset your password",
    allowUnverified: true,
    body: <PasswordResetEmail resetPasswordLink={resetPasswordLink} />,
  });
}


interface GoogleOAuthResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: string
  id_token: string
}
interface GoogleOAuthProfile {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}
