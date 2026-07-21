import type { Request, Response } from 'express';
import { SESSION_COOKIE, parseCookies } from '../lib/sessions.js';
import { getProfile } from '../services/profile.js';
import { findGradesByUserId } from '../models/grade.js';
import { findUserByToken } from '../models/session.js';
import { logger } from '../lib/logger.js';

async function profile(req: Request, res: Response): Promise<void> {
  // Lee las cookies de la solicitud para obtener el token de sesión.
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE];
  const profileId = Number(req.params.id);

  // Valida que el identificador del perfil sea un número entero positivo.
  if (!Number.isInteger(profileId) || profileId <= 0) {
    res.status(400).json({ error: 'ID de usuario inválido.' });
    return;
  }

  // Obtiene el perfil del usuario solicitado mediante el servicio correspondiente.
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
  // Obtiene la cookie de sesión del cliente.
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE];

  // Verifica que exista un token de sesión antes de continuar.
  if (!sessionToken) {
    res.status(401).json({ error: 'Se requiere autenticación.' });
    return;
  }

  // Busca al usuario asociado al token para validar que la sesión siga siendo válida.
  const sessionUser = await findUserByToken(sessionToken);
  if (!sessionUser) {
    res.status(401).json({ error: 'Sesión inválida o expirada.' });
    return;
  }

  // La sesión sí se valida, pero nunca se comprueba que
  // sessionUser.id coincida con req.params.id. Cualquier usuario autenticado puede
  // solicitar las calificaciones de otro usuario cambiando el :id en la URL (IDOR).
  try {
    // Solicita las calificaciones del usuario indicado en la URL.
    const gradesList = await findGradesByUserId(String(req.params.id));
    logger.info('users.grades.served', { requestedId: req.params.id, sessionUserId: sessionUser.id });
    res.json(gradesList);
  } catch (err: any) {
    // Se devuelve el error de la base de datos directamente al cliente.
    // Expone mensajes de PostgreSQL, fragmentos de consulta, nombres de tablas y el stack trace de Node.js.
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
