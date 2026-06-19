import { pool } from '../db.js';

async function findSectionsByTeacherId(teacherId: number): Promise<any[]> {
  const result = await pool.query(
    `SELECT s.id, s.name, s.semester, c.name AS course, c.code
     FROM sections s
     JOIN courses c ON s.course_id = c.id
     WHERE s.teacher_id = $1
     ORDER BY s.semester, s.name`,
    [teacherId]
  );
  return result.rows;
}

async function findById(sectionId: number): Promise<any | null> {
  const result = await pool.query(
    `SELECT s.id, s.name, s.semester, c.name AS course, c.code
     FROM sections s
     JOIN courses c ON s.course_id = c.id
     WHERE s.id = $1`,
    [sectionId]
  );
  return result.rows[0] ?? null;
}

export { findSectionsByTeacherId, findById };
