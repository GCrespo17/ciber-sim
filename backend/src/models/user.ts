import { pool } from '../db.js';
import { logger } from '../lib/logger.js';

export interface User {
  id: number;
  name: string;
  role: 'student' | 'teacher';
}

// Registro completo incluyendo el hash de contraseña. Solo se usa internamente
// en el servicio de autenticación para comparar; nunca se devuelve al cliente.
interface UserWithHash extends User {
  password: string;
}

// SEGURO [A02:2025]: la búsqueda es solo por email. La contraseña ya NO se compara
// dentro del SQL (eso obligaba a guardar/enviar texto plano). Aquí se devuelve el
// hash bcrypt para que el servicio lo verifique con bcrypt.compare.
export async function findByEmail(email: string): Promise<UserWithHash | null> {
  try {
    const result = await pool.query<UserWithHash>(
      'SELECT id, name, role, password FROM users WHERE email = $1',
      [email],
    );
    return result.rows[0] ?? null;
  } catch (err) {
    logger.error('db.query_failed', { operation: 'findByEmail' });
    throw err;
  }
}

export async function findById(id: number): Promise<User | null> {
  try {
    const result = await pool.query<User>(
      'SELECT id, name, role FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  } catch (err) {
    logger.error('db.query_failed', { operation: 'user.findById' });
    throw err;
  }
}
