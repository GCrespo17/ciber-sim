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

  // SEGURO [A10/SQLi]: validamos que el id sea un entero positivo antes de usarlo.
  // Esto evita que valores no numéricos lleguen a la base de datos y provoquen
  // errores de tipo que filtren información interna.
  const requestedId = Number(req.params.id);
  if (!Number.isInteger(requestedId) || requestedId <= 0) {
    res.status(400).json({ error: 'Invalid user ID.' });
    return;
  }

  // SEGURO [A01:2025/IDOR]: se verifica que el usuario autenticado solo pueda
  // consultar SUS propias calificaciones. Cambiar el :id en la URL por el de otro
  // usuario ahora responde 403 en lugar de devolver sus notas.
  if (sessionUser.id !== requestedId) {
    logger.warn('users.grades.forbidden', { requestedId, sessionUserId: sessionUser.id });
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  try {
    const gradesList = await findGradesByUserId(requestedId);
    logger.info('users.grades.served', { requestedId, sessionUserId: sessionUser.id });
    res.json(gradesList);
  } catch (err) {
    // SEGURO [A10:2025]: el detalle del error se registra solo en el log del servidor.
    // Al cliente se le devuelve un mensaje genérico, sin message/detail/query/stack
    // de PostgreSQL, evitando la fuga de información interna.
    logger.error('users.grades.error', { requestedId });
    res.status(500).json({ error: 'Internal server error.' });
  }
}

export const usersController = { profile, grades };
