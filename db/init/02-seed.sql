-- Secure phase seed data.
-- SEGURO [A02:2025]: las contraseñas se almacenan como hash bcrypt (cost 10),
-- nunca en texto plano. Aunque se filtre la base de datos, el atacante no obtiene
-- la contraseña original. Cada usuario tiene su propio salt (embebido en el hash).
-- La contraseña en claro de todos los usuarios semilla sigue siendo: password123
-- Students: student1@example.com .. student5@example.com / password123
-- Teachers: teacher1@example.com, teacher2@example.com / password123

INSERT INTO users (name, email, password, role) VALUES
  ('Ana García',    'student1@example.com', '$2b$10$SlE5X7rQVe2AQysStqMcXer.EkbgUrhPIxJI/mSiGRlHj1vCmS..a', 'student'),
  ('Luis Martínez', 'student2@example.com', '$2b$10$Ejc.aXjSAWc3jrJS0I1BY.D41/veB9Zx57xhkYerRLm2xksGg3KCy', 'student'),
  ('María Torres',  'student3@example.com', '$2b$10$u/06V8ntq4QxBls7JDrlfeVqPa7Xi3MagvLUz67G5GueVFOvcpX/u', 'student'),
  ('Pedro Ramírez', 'student4@example.com', '$2b$10$tKs4hBIefd/NhO1ZKzEnKuW2eO139UaPU2NeRMJwjGFG6.9.Xs9Ru', 'student'),
  ('Sofía Núñez',   'student5@example.com', '$2b$10$4IOD12yJEtXd03nJ33gZH.vEV/T9l6/48OX/qssfm8mwu6e2HmbC6', 'student'),
  ('Carlos Pérez',  'teacher1@example.com', '$2b$10$MOdEP5wQBMu0LpyhbWjbEun7Jm.dYq5Gycn3CbuEFyl7uvwIM0spW', 'teacher'),
  ('Laura Gómez',   'teacher2@example.com', '$2b$10$qFQ7YF7eEHC8atnurioS3ux5sVKpeqdQViGCUCmR6QVLdhzq2ROZu', 'teacher')
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
