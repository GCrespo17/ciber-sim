import { pool } from '../db.js';

// SEGURO [A10:2025 + SQLi]: el userId ya no se concatena. Se pasa como parámetro $1,
// por lo que el driver de PostgreSQL lo trata siempre como un valor (nunca como SQL),
// eliminando la inyección. Además el controlador valida que sea un entero antes de
// llamar a esta función, así que ya no se producen errores de tipo que filtren
// estructura interna de la base de datos.
async function findGradesByUserId(userId: number): Promise<any[]> {
  const result = await pool.query(
    `SELECT g.id, g.score, g.evaluation_type, g.weight, g.period, g.observation,
            c.name AS course, c.code, s.semester, s.name AS section,
            u.name AS student_name, u.id AS student_id
       FROM grades g
       JOIN enrollments e ON g.enrollment_id = e.id
       JOIN sections s ON e.section_id = s.id
       JOIN courses c ON s.course_id = c.id
       JOIN users u ON e.student_id = u.id
      WHERE u.id = $1`,
    [userId]
  );
  return result.rows;
}

async function createGrade(data: {
  enrollment_id: number;
  evaluation_type: string;
  score: number;
  weight: number;
  period: string;
  observation?: string;
}): Promise<any> {
  const result = await pool.query(
    `INSERT INTO grades (enrollment_id, evaluation_type, score, weight, period, observation)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.enrollment_id,
      data.evaluation_type,
      data.score,
      data.weight,
      data.period,
      data.observation ?? null,
    ]
  );
  return result.rows[0];
}

async function updateGrade(
  gradeId: number,
  data: {
    evaluation_type?: string;
    score?: number;
    weight?: number;
    period?: string;
    observation?: string;
  }
): Promise<any | null> {
  const result = await pool.query(
    `UPDATE grades
     SET evaluation_type = COALESCE($1, evaluation_type),
         score           = COALESCE($2, score),
         weight          = COALESCE($3, weight),
         period          = COALESCE($4, period),
         observation     = COALESCE($5, observation)
     WHERE id = $6
     RETURNING *`,
    [
      data.evaluation_type ?? null,
      data.score ?? null,
      data.weight ?? null,
      data.period ?? null,
      data.observation ?? null,
      gradeId,
    ]
  );
  return result.rows[0] ?? null;
}

export { findGradesByUserId, createGrade, updateGrade };
