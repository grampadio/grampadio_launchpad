import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

const COOKIE_NAME = 'grampad_admin';
const TOKEN_ISSUER = 'grampad.io';
const TOKEN_AUDIENCE = 'grampad-admin';
const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const revokedTokenIds = new Map<string, number>();

interface AdminTokenPayload {
  sub: string;
  role: 'admin';
  csrf: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  jti: string;
}

const base64Url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

const getJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_JWT_SECRET must be configured with at least 32 characters.');
  }
  return secret;
};

const parseCookies = (header = '') =>
  header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return cookies;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});

const signToken = (email: string, csrf: string) => {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload: AdminTokenPayload = {
    sub: email,
    role: 'admin',
    csrf,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
    iss: TOKEN_ISSUER,
    aud: TOKEN_AUDIENCE,
    jti: randomBytes(16).toString('hex'),
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  const unsigned = `${header}.${encodedPayload}`;
  const signature = createHmac('sha256', getJwtSecret()).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
};

const verifyToken = (token?: string): AdminTokenPayload | null => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = createHmac('sha256', getJwtSecret()).update(unsigned).digest();
  let received: Buffer;
  try {
    received = Buffer.from(parts[2], 'base64url');
  } catch {
    return null;
  }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as AdminTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (
      payload.role !== 'admin' ||
      payload.iss !== TOKEN_ISSUER ||
      payload.aud !== TOKEN_AUDIENCE ||
      !payload.sub ||
      !payload.csrf ||
      payload.exp <= now ||
      payload.iat > now + 60
    ) {
      return null;
    }
    const revokedUntil = revokedTokenIds.get(payload.jti);
    if (revokedUntil) {
      if (revokedUntil > now) return null;
      revokedTokenIds.delete(payload.jti);
    }
    return payload;
  } catch {
    return null;
  }
};

const safeEqualText = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

export const hashAdminPassword = (password: string, salt = randomBytes(16).toString('hex')) => {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
};

export const verifyAdminCredentials = (email: string, password: string) => {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const stored = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!configuredEmail || !stored) {
    throw new Error('Admin credentials are not configured.');
  }

  const [algorithm, salt, expectedHash] = stored.split(':');
  if (algorithm !== 'scrypt' || !salt || !expectedHash) {
    throw new Error('ADMIN_PASSWORD_HASH is invalid.');
  }
  const actualHash = scryptSync(password, salt, 64).toString('hex');
  return safeEqualText(email.trim().toLowerCase(), configuredEmail) &&
    safeEqualText(actualHash, expectedHash);
};

export const createAdminSession = (res: Response, email: string) => {
  const csrfToken = randomBytes(24).toString('base64url');
  const token = signToken(email.trim().toLowerCase(), csrfToken);
  const secure = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS * 1000,
  });
  return csrfToken;
};

export const clearAdminSession = (res: Response) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};

export const revokeAdminSession = (req: Request) => {
  const session = getAdminSession(req);
  if (session) revokedTokenIds.set(session.jti, session.exp);
};

export const getAdminSession = (req: Request) => {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  return verifyToken(token);
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = getAdminSession(req);
    if (!session) {
      res.status(401).json({ error: 'Admin authentication required.' });
      return;
    }
    res.locals.admin = session;
    next();
  } catch (error: any) {
    res.status(503).json({ error: error.message });
  }
};

export const requireAdminMutation = (req: Request, res: Response, next: NextFunction) => {
  requireAdmin(req, res, () => {
    const csrf = String(req.get('x-csrf-token') || '');
    const session = res.locals.admin as AdminTokenPayload;
    if (!csrf || !safeEqualText(csrf, session.csrf)) {
      res.status(403).json({ error: 'Invalid admin request token.' });
      return;
    }
    next();
  });
};
