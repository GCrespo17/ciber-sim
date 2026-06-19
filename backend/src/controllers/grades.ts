import type { Request, Response } from 'express';
import { SESSION_COOKIE, parseCookies } from '../lib/sessions.js';
import { findUserByToken } from '../models/session.js';
import { createGrade, updateGrade } from '../models/grade.js';
import { logger } from '../lib/logger.js';

async function create(req: Request, res: Response): Promise<void> {
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

  const { enrollment_id, evaluation_type, score, weight, period, observation } = req.body;

  if (!enrollment_id || !evaluation_type || score === undefined || !weight || !period) {
    res.status(400).json({ error: 'Missing required fields.' });
    return;
  }

  const grade = await createGrade({
    enrollment_id,
    evaluation_type,
    score,
    weight,
    period,
    observation,
  });

  logger.info('grades.create.success', { gradeId: grade.id, teacherId: sessionUser.id });
  res.status(201).json(grade);
}

async function update(req: Request, res: Response): Promise<void> {
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

  const gradeId = Number(req.params.id);
  if (!Number.isInteger(gradeId) || gradeId <= 0) {
    res.status(400).json({ error: 'Invalid grade ID.' });
    return;
  }

  const { evaluation_type, score, weight, period, observation } = req.body;
  const updated = await updateGrade(gradeId, { evaluation_type, score, weight, period, observation });

  if (!updated) {
    res.status(404).json({ error: 'Grade not found.' });
    return;
  }

  logger.info('grades.update.success', { gradeId, teacherId: sessionUser.id });
  res.json(updated);
}

export const gradesController = { create, update };
