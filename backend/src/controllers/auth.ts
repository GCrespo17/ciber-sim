import type { Request, Response } from 'express';
import { SESSION_COOKIE, parseCookies } from '../lib/sessions.js';
import {
  authenticateUser,
  createSession,
  deleteSession,
} from '../services/auth.js';
import { logger } from '../lib/logger.js';

async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body || {};

  if (!email || !password) {
    logger.warn('login.validation_failed', { reason: 'missing_fields' });
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = await authenticateUser(String(email), String(password));
  if (!user) {
    logger.warn('login.failed', { email: String(email) });
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = await createSession(user.id);
  logger.info('login.success', { userId: user.id, role: user.role });

  // SEGURO [A05:2025]: cookie de sesión endurecida con flags básicos.
  // - httpOnly: true  -> el token deja de ser legible por JavaScript, mitigando
  //   el robo de sesión vía XSS (antes estaba en false).
  // - secure          -> en producción solo viaja por HTTPS.
  // - sameSite: lax   -> reduce el riesgo de CSRF en peticiones cross-site.
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ id: user.id, name: user.name, role: user.role });
}

async function logout(req: Request, res: Response): Promise<void> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];

  if (token) {
    await deleteSession(token);
    logger.info('logout.success', { token: token.slice(0, 8) + '...' });
  } else {
    logger.info('logout.no_session');
  }

  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
}

export const authController = { login, logout };
