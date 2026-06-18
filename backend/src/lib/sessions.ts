import crypto from 'node:crypto';

const SESSION_COOKIE = 'session_token';

function parseCookies(header?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq !== -1) {
      const key = part.slice(0, eq).trim();
      const val = part.slice(eq + 1).trim();
      if (key) result[key] = val;
    }
  }
  return result;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export { SESSION_COOKIE, parseCookies, generateToken };
