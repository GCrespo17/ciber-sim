import { pool } from '../db.js';

//  El identificador de usuario se concatena directamente en la consulta SQL
//  Sin parametrización ni validación de tipo.
// - Si userId no es numérico, PostgreSQL genera un error de tipo que se propaga
//   al cliente, exponiendo detalles internos del sistema.
// - Si userId corresponde a otro usuario válido, no existe una comprobación de propiedad y se pueden
//   devolver sus calificaciones.
async function findGradesByUserId(userId: string): Promise<any[]> {
  // Busca las calificaciones asociadas a un usuario específico.
  // En esta versión vulnerable, el valor se inserta directamente en el SQL, lo que permite
  // manipular la consulta y filtrar información de forma insegura.
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

// Crea una nueva calificación para una matrícula específica.
// Recibe los datos necesarios para insertar el registro en la tabla grades.
async function createGrade(data: {
  enrollment_id: number;
  evaluation_type: string;
  score: number;
  weight: number;S
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

// Actualiza una calificación existente utilizando los campos proporcionados.
// El uso de COALESCE permite conservar los valores actuales cuando un campo no se envía.
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
  // Ejecuta una actualización parcial del registro de calificación.
  // Solo los campos presentes en data son modificados; los demás se mantienen intactos.
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
  // Devuelve la fila actualizada si existe; en caso contrario, retorna null.
  return result.rows[0] ?? null;
}

export { findGradesByUserId, createGrade, updateGrade };
