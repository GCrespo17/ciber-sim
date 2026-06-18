import { pool } from '../db.js';

// VULNERABLE [A10:2025 + A01:2025]: userId is concatenated directly into the SQL query
// without parameterization or type validation.
// - If userId is non-numeric (e.g. "abc"), PostgreSQL throws a type error that propagates
//   raw to the caller, leaking internals (A10).
// - If userId is a valid integer for another user, no ownership check prevents returning
//   their grades (A01).
async function findGradesByUserId(userId: string): Promise<any[]> {
  const result = await pool.query(
    'SELECT g.id, g.score, g.evaluation_type, g.weight, g.period, g.observation, ' +
    'c.name AS course, c.code, s.semester, s.name AS section, ' +
    'u.name AS student_name, u.id AS student_id ' +
    'FROM grades g ' +
    'JOIN enrollments e ON g.enrollment_id = e.id ' +
    'JOIN sections s ON e.section_id = s.id ' +
    'JOIN courses c ON s.course_id = c.id ' +
    'JOIN users u ON e.student_id = u.id ' +
    'WHERE u.id = ' + userId
  );
  return result.rows;
}

export { findGradesByUserId };
