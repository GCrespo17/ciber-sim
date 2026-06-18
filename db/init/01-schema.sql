-- Vulnerable Phase 1 schema: users and sessions for HU-01
-- Plaintext passwords are a deliberate vulnerable-phase choice.
CREATE TABLE IF NOT EXISTS users (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role  TEXT NOT NULL CHECK (role IN ('student', 'teacher'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id        SERIAL PRIMARY KEY,
  token     TEXT NOT NULL UNIQUE,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id   SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  id         SERIAL PRIMARY KEY,
  course_id  INTEGER NOT NULL REFERENCES courses(id),
  teacher_id INTEGER NOT NULL REFERENCES users(id),
  semester   TEXT NOT NULL,
  name       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id         SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id),
  section_id INTEGER NOT NULL REFERENCES sections(id)
);

CREATE TABLE IF NOT EXISTS grades (
  id              SERIAL PRIMARY KEY,
  enrollment_id   INTEGER NOT NULL REFERENCES enrollments(id),
  evaluation_type TEXT NOT NULL,
  score           NUMERIC(4,1) NOT NULL CHECK (score >= 0 AND score <= 20),
  weight          NUMERIC(5,2) NOT NULL,
  period          TEXT NOT NULL,
  observation     TEXT
);
