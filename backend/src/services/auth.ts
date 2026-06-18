import { findByEmailAndPassword } from '../models/user.js';
import { create, remove } from '../models/session.js';
import type { User } from '../models/user.js';

async function authenticateUser(email: string, password: string): Promise<User | null> {
  return findByEmailAndPassword(email, password);
}

async function createSession(userId: number): Promise<string> {
  return create(userId);
}

async function deleteSession(token: string): Promise<void> {
  return remove(token);
}

export { authenticateUser, createSession, deleteSession };
export type { User };
