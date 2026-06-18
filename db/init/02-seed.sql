-- Vulnerable phase seed data.
-- Credentials are deliberately in plaintext for the vulnerable phase.
-- Students: student1@example.com .. student5@example.com / password123
-- Teachers: teacher1@example.com, teacher2@example.com / password123

INSERT INTO users (name, email, password, role) VALUES
  ('Ana García',    'student1@example.com', 'password123', 'student'),
  ('Luis Martínez', 'student2@example.com', 'password123', 'student'),
  ('María Torres',  'student3@example.com', 'password123', 'student'),
  ('Pedro Ramírez', 'student4@example.com', 'password123', 'student'),
  ('Sofía Núñez',   'student5@example.com', 'password123', 'student'),
  ('Carlos Pérez',  'teacher1@example.com', 'password123', 'teacher'),
  ('Laura Gómez',   'teacher2@example.com', 'password123', 'teacher')
ON CONFLICT (email) DO NOTHING;

INSERT INTO courses (code, name) VALUES
  ('MAT101', 'Matemáticas I'),
  ('PRG201', 'Programación II'),
  ('BD301',  'Base de Datos')
ON CONFLICT (code) DO NOTHING;

-- teacher1 = id 6, teacher2 = id 7
INSERT INTO sections (course_id, teacher_id, semester, name) VALUES
  (1, 6, '2026-1', 'MAT101-A'),
  (2, 6, '2026-1', 'PRG201-A'),
  (3, 7, '2026-1', 'BD301-A'),
  (3, 7, '2026-1', 'BD301-B');

-- student ids: 1=Ana, 2=Luis, 3=María, 4=Pedro, 5=Sofía
INSERT INTO enrollments (student_id, section_id) VALUES
  (1, 1), (1, 2), (1, 3),
  (2, 1), (2, 3),
  (3, 2), (3, 4),
  (4, 1), (4, 2),
  (5, 3), (5, 4);

-- enrollment ids follow insertion order: 1-11
INSERT INTO grades (enrollment_id, evaluation_type, score, weight, period, observation) VALUES
  (1,  'Parcial 1', 16.0, 30, '2026-1', NULL),
  (1,  'Parcial 2', 14.5, 30, '2026-1', NULL),
  (2,  'Parcial 1', 18.0, 30, '2026-1', 'Excelente'),
  (3,  'Parcial 1', 12.0, 30, '2026-1', NULL),
  (4,  'Parcial 1', 15.5, 30, '2026-1', NULL),
  (5,  'Parcial 1', 17.0, 30, '2026-1', NULL),
  (6,  'Parcial 1', 13.0, 30, '2026-1', NULL),
  (7,  'Parcial 1', 19.0, 30, '2026-1', 'Sobresaliente'),
  (8,  'Parcial 1', 11.0, 30, '2026-1', 'Mejorar'),
  (9,  'Parcial 1', 14.0, 30, '2026-1', NULL),
  (10, 'Parcial 1', 16.5, 30, '2026-1', NULL),
  (11, 'Parcial 1', 10.0, 30, '2026-1', NULL);
