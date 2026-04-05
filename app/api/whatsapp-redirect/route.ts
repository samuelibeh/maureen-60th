import { NextRequest, NextResponse } from 'next/server';
import { initDb, markWhatsappRedirected } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ ok: false });
  await initDb();
  await markWhatsappRedirected(email);
  return NextResponse.json({ ok: true });
}
