import { pool } from '../db.js';
import { generateToken } from '../lib/sessions.js';
import { logger } from '../lib/logger.js';
import type { User } from './user.js';

export interface Session {
  id: number;
  token: string;
  userId: number;
}

export async function create(userId: number): Promise<string> {
  const token = generateToken();
  try {
    await pool.query(
      'INSERT INTO sessions (token, user_id) VALUES ($1, $2)',
      [token, userId],
    );
    return token;
  } catch (err) {
    logger.error('db.query_failed', { operation: 'session.create', userId });
    throw err;
  }
}

export async function remove(token: string): Promise<void> {
  try {
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  } catch (err) {
    logger.error('db.query_failed', { operation: 'session.remove' });
    throw err;
  }
}

export async function findUserByToken(token: string): Promise<User | null> {
  try {
    const result = await pool.query<User>(
      `SELECT u.id, u.name, u.role
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token = $1`,
      [token],
    );
    return result.rows[0] ?? null;
  } catch (err) {
    logger.error('db.query_failed', { operation: 'session.findUserByToken' });
    throw err;
  }
}
