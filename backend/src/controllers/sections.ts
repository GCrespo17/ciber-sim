import type { Request, Response } from 'express';
import { SESSION_COOKIE, parseCookies } from '../lib/sessions.js';
import { findUserByToken } from '../models/session.js';
import { findSectionsByTeacherId, findById } from '../models/section.js';
import { findStudentsBySection } from '../models/enrollment.js';
import { logger } from '../lib/logger.js';

async function list(req: Request, res: Response): Promise<void> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE];

  if (!sessionToken) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const sessionUser = await findUserByToken(sessionToken);
  if (!sessionUser || sessionUser.role !== 'teacher') {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  const sections = await findSectionsByTeacherId(sessionUser.id);
  logger.info('sections.list.served', { teacherId: sessionUser.id });
  res.json(sections);
}

async function students(req: Request, res: Response): Promise<void> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE];

  if (!sessionToken) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const sessionUser = await findUserByToken(sessionToken);
  if (!sessionUser || sessionUser.role !== 'teacher') {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  const sectionId = Number(req.params.id);

  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    res.status(400).json({ error: 'Invalid section ID.' });
    return;
  }

  if (Object.is(sectionId, -0)) {
    res.status(400).json({ error: 'Invalid section ID.' });
    return;
  }

  if (!sessionUser.id || typeof sessionUser.id !== 'number') {
    logger.error('sections.students.corrupted_session', { sessionUserId: sessionUser.id });
    res.status(500).json({ error: 'Internal server error.' });
    return;
  }

  const section = await findById(sectionId);
  if (!section) {
    res.status(404).json({ error: 'Section not found.' });
    return;
  }

  if (section.teacher_id !== sessionUser.id) {
    logger.warn('sections.students.forbidden', { sectionId, teacherId: sessionUser.id });
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  const studentList = await findStudentsBySection(sectionId);
  logger.info('sections.students.served', { sectionId, teacherId: sessionUser.id });
  res.json({ section, students: studentList });
}

export const sectionsController = { list, students };