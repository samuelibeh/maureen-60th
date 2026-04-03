import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export async function emailExists(email: string): Promise<boolean> {
  const res = await pool.query('SELECT 1 FROM rsvps WHERE email = $1', [email]);
  return res.rowCount! > 0;
}

export async function insertRsvp(fullName: string, email: string, phone: string, message: string) {
  await pool.query(
    'INSERT INTO rsvps (full_name, email, phone, message) VALUES ($1, $2, $3, $4)',
    [fullName, email, phone || null, message || null]
  );
}

export async function getMessages(): Promise<{ full_name: string; message: string; created_at: string }[]> {
  const res = await pool.query(
    `SELECT full_name, message, created_at FROM rsvps WHERE message IS NOT NULL AND message != '' ORDER BY created_at DESC`
  );
  return res.rows;
}
