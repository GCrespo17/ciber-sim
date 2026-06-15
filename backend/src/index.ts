import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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

app.use(express.static(frontendDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ciber-sim backend listening on http://localhost:${PORT}`);
});
