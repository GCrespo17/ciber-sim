import { pool } from '../db.js';
import { logger } from '../lib/logger.js';

export interface User {
  id: number;
  name: string;
  role: 'student' | 'teacher';
}

export async function findByEmailAndPassword(email: string, password: string): Promise<User | null> {
  try {
    const result = await pool.query<User>(
      'SELECT id, name, role FROM users WHERE email = $1 AND password = $2',
      [email, password],
    );
    return result.rows[0] ?? null;
  } catch (err) {
    logger.error('db.query_failed', { operation: 'findByEmailAndPassword' });
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
