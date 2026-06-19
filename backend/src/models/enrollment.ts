import { pool } from '../db.js';

async function findStudentsBySection(sectionId: number): Promise<any[]> {
  const result = await pool.query(
    `SELECT e.id AS enrollment_id, u.id AS student_id, u.name AS student_name,
            json_agg(
              json_build_object(
                'id', g.id,
                'evaluation_type', g.evaluation_type,
                'score', g.score,
                'weight', g.weight,
                'period', g.period,
                'observation', g.observation
              ) ORDER BY g.id
            ) FILTER (WHERE g.id IS NOT NULL) AS grades
     FROM enrollments e
     JOIN users u ON e.student_id = u.id
     LEFT JOIN grades g ON g.enrollment_id = e.id
     WHERE e.section_id = $1
     GROUP BY e.id, u.id, u.name
     ORDER BY u.name`,
    [sectionId]
  );
  return result.rows;
}

export { findStudentsBySection };
