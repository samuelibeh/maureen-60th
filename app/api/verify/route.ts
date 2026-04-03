import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';

  try {
    const parts = token.split('|');
    if (parts.length !== 4) throw new Error('bad format');

    const [id, name, email, sig] = parts;
    const secret = process.env.QR_SECRET!;
    const payload = `${id}|${name}|${email}`;
    const expected = createHmac('sha256', secret).update(payload).digest('hex');

    if (sig !== expected) {
      return NextResponse.json({ valid: false, reason: 'Invalid QR code.' });
    }

    return NextResponse.json({ valid: true, name, email, id });
  } catch {
    return NextResponse.json({ valid: false, reason: 'Unreadable QR code.' });
  }
}
