import type { Request, Response } from 'express';
import { SESSION_COOKIE, parseCookies } from '../lib/sessions.js';
import { findUserByToken } from '../models/session.js';
import { createGrade, updateGrade } from '../models/grade.js';
import { findTeacherIdByEnrollment, findTeacherIdByGrade } from '../models/section.js';
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

  if (!sessionUser.id || typeof sessionUser.id !== 'number') {
    logger.error('grades.create.corrupted_session', { sessionUserId: sessionUser.id });
    res.status(500).json({ error: 'Internal server error.' });
    return;
  }

  const { enrollment_id, evaluation_type, score, weight, period, observation } = req.body;

  if (!enrollment_id || !evaluation_type || score === undefined || !weight || !period) {
    res.status(400).json({ error: 'Missing required fields.' });
    return;
  }

  const numericEnrollment = Number(enrollment_id);
  if (!Number.isInteger(numericEnrollment) || numericEnrollment <= 0) {
    res.status(400).json({ error: 'Invalid enrollment ID.' });
    return;
  }
  if (Object.is(numericEnrollment, -0)) {
    res.status(400).json({ error: 'Invalid enrollment ID.' });
    return;
  }

  const numericScore = Number(score);
  if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
    res.status(400).json({ error: 'Score must be between 0 and 100.' });
    return;
  }

  const numericWeight = Number(weight);
  if (isNaN(numericWeight) || numericWeight < 1 || numericWeight > 100) {
    res.status(400).json({ error: 'Weight must be between 1 and 100.' });
    return;
  }

  const ownerTeacherId = await findTeacherIdByEnrollment(numericEnrollment);
  if (ownerTeacherId === null) {
    res.status(404).json({ error: 'Enrollment not found.' });
    return;
  }
  if (ownerTeacherId !== sessionUser.id) {
    logger.warn('grades.create.forbidden', { enrollmentId: enrollment_id, teacherId: sessionUser.id });
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  const grade = await createGrade({
    enrollment_id: numericEnrollment,
    evaluation_type,
    score: numericScore,
    weight: numericWeight,
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

  if (!sessionUser.id || typeof sessionUser.id !== 'number') {
    logger.error('grades.update.corrupted_session', { sessionUserId: sessionUser.id });
    res.status(500).json({ error: 'Internal server error.' });
    return;
  }

  const gradeId = Number(req.params.id);
  if (!Number.isInteger(gradeId) || gradeId <= 0) {
    res.status(400).json({ error: 'Invalid grade ID.' });
    return;
  }
  if (Object.is(gradeId, -0)) {
    res.status(400).json({ error: 'Invalid grade ID.' });
    return;
  }

  const ownerTeacherId = await findTeacherIdByGrade(gradeId);
  if (ownerTeacherId === null) {
    res.status(404).json({ error: 'Grade not found.' });
    return;
  }
  if (ownerTeacherId !== sessionUser.id) {
    logger.warn('grades.update.forbidden', { gradeId, teacherId: sessionUser.id });
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  const { evaluation_type, score, weight, period, observation } = req.body;

  if (score !== undefined) {
    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      res.status(400).json({ error: 'Score must be between 0 and 100.' });
      return;
    }
  }
  if (weight !== undefined) {
    const numericWeight = Number(weight);
    if (isNaN(numericWeight) || numericWeight < 1 || numericWeight > 100) {
      res.status(400).json({ error: 'Weight must be between 1 and 100.' });
      return;
    }
  }

  const updated = await updateGrade(gradeId, { evaluation_type, score, weight, period, observation });

  if (!updated) {
    res.status(404).json({ error: 'Grade not found.' });
    return;
  }

  logger.info('grades.update.success', { gradeId, teacherId: sessionUser.id });
  res.json(updated);
}

export const gradesController = { create, update };