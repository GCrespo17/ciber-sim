import type { Request, Response } from 'express';
import { SESSION_COOKIE, parseCookies } from '../lib/sessions.js';
import { getProfile } from '../services/profile.js';
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

export const usersController = { profile };
