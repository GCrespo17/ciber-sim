import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'ciber_sim',
  user: process.env.POSTGRES_USER || 'devuser',
  password: process.env.POSTGRES_PASSWORD || 'devpassword',
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export { pool };
