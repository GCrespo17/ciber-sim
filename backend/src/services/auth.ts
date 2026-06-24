import bcrypt from 'bcryptjs';
import { findByEmail } from '../models/user.js';
import { create, remove } from '../models/session.js';
import type { User } from '../models/user.js';

// SEGURO [A02:2025]: la autenticación busca al usuario por email y verifica la
// contraseña con bcrypt.compare contra el hash almacenado. La contraseña en claro
// nunca se guarda ni se compara directamente en la base de datos. Se devuelve solo
// id/name/role, descartando el hash para que no salga del servicio.
async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await findByEmail(email);
  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return null;
  }

  return { id: user.id, name: user.name, role: user.role };
}

async function createSession(userId: number): Promise<string> {
  return create(userId);
}

async function deleteSession(token: string): Promise<void> {
  return remove(token);
}

export { authenticateUser, createSession, deleteSession };
export type { User };
