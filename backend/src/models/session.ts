import { pool } from '../db.js';
import { generateToken } from '../lib/sessions.js';
import { logger } from '../lib/logger.js';
import type { User } from './user.js';

// Define la estructura de una sesión activa en la base de datos.
// Representa la relación entre un token de autenticación y un usuario.
export interface Session {
  id: number;
  token: string;
  userId: number;
}

// Crea una nueva sesión para un usuario autenticado.
// Genera un token aleatorio y lo almacena en la tabla de sesiones.
export async function create(userId: number): Promise<string> {
  // Genera un token seguro que se usará para identificar la sesión.
  const token = generateToken();
  try {
    // Inserta la sesión en la base de datos asociando el token con el usuario.
    await pool.query(
      'INSERT INTO sessions (token, user_id) VALUES ($1, $2)',
      [token, userId],
    );
    return token;
  } catch (err) {
    // Registra el error si no se pudo crear la sesión.
    logger.error('db.query_failed', { operation: 'session.create', userId });
    throw err;
  }
}

// Elimina una sesión existente a partir de su token.
// Se usa normalmente cuando un usuario cierra sesión.
export async function remove(token: string): Promise<void> {
  try {
    // Borra la sesión correspondiente al token recibido.
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  } catch (err) {
    // Registra cualquier problema al intentar eliminar la sesión.
    logger.error('db.query_failed', { operation: 'session.remove' });
    throw err;
  }
}

// Busca el usuario asociado a un token de sesión.
// Sirve para validar si la sesión sigue siendo válida y recuperar los datos del usuario.
export async function findUserByToken(token: string): Promise<User | null> {
  try {
    // Realiza una consulta que une sessions con users para obtener el usuario propietario del token.
    const result = await pool.query<User>(
      `SELECT u.id, u.name, u.role
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token = $1`,
      [token],
    );
    // Devuelve el primer usuario encontrado o null si no existe una sesión válida.
    return result.rows[0] ?? null;
  } catch (err) {
    // Registra cualquier error de base de datos durante la búsqueda de la sesión.
    logger.error('db.query_failed', { operation: 'session.findUserByToken' });
    throw err;
  }
}
