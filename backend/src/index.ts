import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import sectionsRouter from './routes/sections.js';
import gradesRouter from './routes/grades.js';
import { logger } from './lib/logger.js';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveFrontendDir(): string {
  const devDir = path.resolve(__dirname, '../../frontend');
  if (existsSync(path.join(devDir, 'index.html'))) {
    return devDir;
  }
  return path.resolve(__dirname, '../frontend');
}

const frontendDir = resolveFrontendDir();
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.static(frontendDir));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/grades', gradesRouter);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', uptime: process.uptime() });
  } catch (err) {
    logger.error('health.db_error', { error: String(err) });
    res.status(503).json({ status: 'degraded', error: 'database' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, () => {
  logger.info('server.startup', { port: PORT, frontendDir });
});
