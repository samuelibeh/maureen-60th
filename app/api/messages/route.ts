import { NextResponse } from 'next/server';
import { initDb, getMessages } from '@/lib/db';

export async function GET() {
  await initDb();
  const messages = await getMessages();
  return NextResponse.json(messages);
}
