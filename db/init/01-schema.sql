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
