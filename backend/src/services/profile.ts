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

  // SEGURO [A01:2025]: verificacion de propiedad. Estar autenticado no basta;
  // el usuario solo puede consultar SU propio perfil. Si el :id de la URL no
  // coincide con el id de la sesion, se rechaza con 403 (IDOR cerrado).
  if (sessionUser.id !== profileId) {
    return { user: null, error: { status: 403, message: 'Access denied.' } };
  }

  const profile = await findById(profileId);
  if (!profile) {
    return { user: null, error: { status: 404, message: 'Profile not found.' } };
  }

  return { user: profile, error: null };
}

export { getProfile };
