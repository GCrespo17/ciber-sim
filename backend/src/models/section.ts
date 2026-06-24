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
    `SELECT s.id, s.name, s.semester, s.teacher_id, c.name AS course, c.code
     FROM sections s
     JOIN courses c ON s.course_id = c.id
     WHERE s.id = $1`,
    [sectionId]
  );
  return result.rows[0] ?? null;
}

// SEGURO [A01:2025]: helpers de propiedad. Resuelven a qué profesor pertenece
// una inscripción o una calificación, subiendo por enrollments -> sections.
// Los controladores los usan para verificar que el profesor autenticado sea
// el dueño del recurso antes de crear/editar notas.
async function findTeacherIdByEnrollment(enrollmentId: number): Promise<number | null> {
  const result = await pool.query(
    `SELECT s.teacher_id
     FROM enrollments e
     JOIN sections s ON e.section_id = s.id
     WHERE e.id = $1`,
    [enrollmentId]
  );
  return result.rows[0]?.teacher_id ?? null;
}

async function findTeacherIdByGrade(gradeId: number): Promise<number | null> {
  const result = await pool.query(
    `SELECT s.teacher_id
     FROM grades g
     JOIN enrollments e ON g.enrollment_id = e.id
     JOIN sections s ON e.section_id = s.id
     WHERE g.id = $1`,
    [gradeId]
  );
  return result.rows[0]?.teacher_id ?? null;
}

export { findSectionsByTeacherId, findById, findTeacherIdByEnrollment, findTeacherIdByGrade };
