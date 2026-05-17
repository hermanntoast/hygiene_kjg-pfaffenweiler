/**
 * Admin authentication: bcrypt + cookie-session.
 *
 * Single admin (no user table). Passwort liegt nur als bcrypt-Hash in der
 * .env-Variable ADMIN_PASSWORD_HASH. Login schreibt das signierte httpOnly-
 * Cookie; Middleware prueft das Cookie auf nachfolgenden Routen.
 */

import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

export function getAdminHash(): string {
  const h = process.env.ADMIN_PASSWORD_HASH;
  // bcrypt-Hashes beginnen immer mit "$2a$" / "$2b$" / "$2y$". Alles andere
  // ist ein Placeholder oder ein Tippfehler.
  if (!h || !/^\$2[aby]\$/.test(h)) {
    throw new Error(
      'ADMIN_PASSWORD_HASH is missing or not a bcrypt hash. Set a real bcrypt hash in .env.',
    );
  }
  return h;
}

export async function verifyPassword(plain: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, getAdminHash());
  } catch {
    return false;
  }
}

export const requireAdmin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = req.session as { admin?: boolean } | null | undefined;
  if (session && session.admin === true) {
    return next();
  }
  res.status(401).json({ error: 'unauthenticated' });
};
