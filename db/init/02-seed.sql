-- Vulnerable Phase 1 seed data: seeded users for HU-01 validation
-- Credentials are deliberately in plaintext for the vulnerable phase.
-- Seeded student credentials:  student@example.com / password123
-- Seeded teacher credentials:  teacher@example.com / password123
INSERT INTO users (name, email, password, role) VALUES
  ('Ana García', 'student@example.com', 'password123', 'student'),
  ('Carlos Pérez', 'teacher@example.com', 'password123', 'teacher')
ON CONFLICT (email) DO NOTHING;
