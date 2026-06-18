import type { Request, Response } from 'express';
import { SESSION_COOKIE, parseCookies } from '../lib/sessions.js';
import { getProfile } from '../services/profile.js';
import { findGradesByUserId } from '../models/grade.js';
import { findUserByToken } from '../models/session.js';
import { logger } from '../lib/logger.js';

async function profile(req: Request, res: Response): Promise<void> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE];
  const profileId = Number(req.params.id);

  if (!Number.isInteger(profileId) || profileId <= 0) {
    res.status(400).json({ error: 'Invalid user ID.' });
    return;
  }

  const result = await getProfile(sessionToken, profileId);

  if (result.error) {
    logger.warn('users.profile.rejected', { profileId, status: result.error.status });
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }

  logger.info('users.profile.served', { profileId, targetId: result.user!.id });
  res.json({ id: result.user!.id, name: result.user!.name, role: result.user!.role });
}

async function grades(req: Request, res: Response): Promise<void> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE];

  if (!sessionToken) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const sessionUser = await findUserByToken(sessionToken);
  if (!sessionUser) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return;
  }

  // VULNERABLE [A01:2025]: session is validated but we never verify that
  // sessionUser.id matches req.params.id. Any authenticated user can request
  // any other user's grades by changing the :id in the URL (IDOR).
  try {
    const gradesList = await findGradesByUserId(String(req.params.id));
    logger.info('users.grades.served', { requestedId: req.params.id, sessionUserId: sessionUser.id });
    res.json(gradesList);
  } catch (err: any) {
    // VULNERABLE [A10:2025]: raw database error returned to client.
    // Exposes PostgreSQL message, query fragment, table names and Node.js stack trace.
    logger.error('users.grades.error', { requestedId: req.params.id });
    res.status(500).json({
      error: err.message,
      detail: err.detail,
      query: err.query,
      stack: err.stack,
    });
  }
}

export const usersController = { profile, grades };
