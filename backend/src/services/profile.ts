import { findUserByToken } from '../models/session.js';
import { findById } from '../models/user.js';
import type { User } from '../models/user.js';

async function getProfile(sessionToken: string | undefined, profileId: number): Promise<{ user: User | null; error: { status: number; message: string } | null }> {
  if (!sessionToken) {
    return { user: null, error: { status: 401, message: 'Authentication required.' } };
  }

  const sessionUser = await findUserByToken(sessionToken);
  if (!sessionUser) {
    return { user: null, error: { status: 401, message: 'Invalid or expired session.' } };
  }

  const profile = await findById(profileId);
  if (!profile) {
    return { user: null, error: { status: 404, message: 'Profile not found.' } };
  }

  return { user: profile, error: null };
}

export { getProfile };
