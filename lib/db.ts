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
      email_sent BOOLEAN DEFAULT FALSE,
      whatsapp_redirected BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Add columns if table already exists (safe migration)
  await pool.query(`ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS whatsapp_redirected BOOLEAN DEFAULT FALSE`);
}

export async function emailExists(email: string): Promise<boolean> {
  const res = await pool.query('SELECT 1 FROM rsvps WHERE email = $1', [email]);
  return res.rowCount! > 0;
}

export async function insertRsvp(fullName: string, email: string, phone: string, message: string, emailSent: boolean) {
  await pool.query(
    'INSERT INTO rsvps (full_name, email, phone, message, email_sent) VALUES ($1, $2, $3, $4, $5)',
    [fullName, email, phone || null, message || null, emailSent]
  );
}

export async function markWhatsappRedirected(email: string) {
  await pool.query('UPDATE rsvps SET whatsapp_redirected = TRUE WHERE email = $1', [email]);
}

export async function getMessages(): Promise<{ full_name: string; message: string; created_at: string }[]> {
  const res = await pool.query(
    `SELECT full_name, message, created_at FROM rsvps WHERE message IS NOT NULL AND message != '' ORDER BY created_at DESC`
  );
  return res.rows;
}
