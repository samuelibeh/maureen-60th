import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodemailer = require('nodemailer');
import { initDb, emailExists, insertRsvp } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, phone, message } = await req.json();

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const fullName = `${firstName} ${lastName}`;

  await initDb();

  if (await emailExists(email)) {
    return NextResponse.json(
      { error: 'This email has already been registered. See you on May 9th!' },
      { status: 409 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Maureen's 60th" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Access Card — Maureen Ben-Ibeh's 60th Birthday 🎉",
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;">

    <!-- TOP: Cream section -->
    <div style="background:#f5f0e8;padding:20px 28px 18px;position:relative;overflow:hidden;">
      <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:110px;height:110px;border-radius:50%;border:1px solid rgba(201,168,76,0.2);"></div>
      <div style="position:absolute;right:40px;top:50%;transform:translateY(-50%);width:60px;height:60px;border-radius:50%;border:1px solid rgba(201,168,76,0.15);"></div>

      <div style="background:#c9a84c;display:inline-block;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.2em;padding:4px 14px;margin-bottom:10px;text-transform:uppercase;">ACCESS CARD</div>

      <p style="margin:0 0 2px;font-size:28px;font-weight:900;letter-spacing:0.06em;color:#1a1a1a;text-transform:uppercase;font-style:italic;line-height:1;">MAUREEN BEN-IBEH</p>

      <div style="text-align:center;line-height:1;margin:2px 0 10px;">
        <span style="font-size:34px;font-weight:900;color:#c9a84c;vertical-align:super;">@</span><span style="font-size:100px;font-weight:900;color:#1a1a1a;letter-spacing:-4px;">60</span>
      </div>

      <table width="100%" cellspacing="0" cellpadding="0" style="border-top:2px solid #1a1a1a;padding-top:10px;">
        <tr>
          <td style="text-align:center;padding:0 6px;">
            <div style="font-size:20px;font-weight:900;color:#1a1a1a;">9TH</div>
            <div style="font-size:8px;letter-spacing:0.15em;color:#888;margin-top:1px;text-transform:uppercase;">Date</div>
          </td>
          <td style="text-align:center;padding:0 6px;">
            <div style="font-size:20px;font-weight:900;color:#1a1a1a;">MAY</div>
            <div style="font-size:8px;letter-spacing:0.15em;color:#888;margin-top:1px;text-transform:uppercase;">Month</div>
          </td>
          <td style="text-align:center;padding:0 6px;">
            <div style="font-size:20px;font-weight:900;color:#1a1a1a;">2026</div>
            <div style="font-size:8px;letter-spacing:0.15em;color:#888;margin-top:1px;text-transform:uppercase;">Year</div>
          </td>
          <td style="text-align:center;padding:0 6px;">
            <div style="font-size:20px;font-weight:900;color:#1a1a1a;">1PM</div>
            <div style="font-size:8px;letter-spacing:0.15em;color:#888;margin-top:1px;text-transform:uppercase;">Time</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- BOTTOM: Gold section -->
    <div style="background:#c9a84c;padding:20px 28px 20px;position:relative;overflow:hidden;">
      <div style="position:absolute;left:-20px;bottom:-20px;width:110px;height:110px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);"></div>
      <div style="position:absolute;left:20px;bottom:20px;width:60px;height:60px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);"></div>

      <h2 style="margin:0 0 3px;font-size:24px;font-weight:900;color:#fff;letter-spacing:0.04em;text-transform:uppercase;">YOU ARE CONFIRMED</h2>
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#1a1a1a;letter-spacing:0.08em;text-transform:uppercase;">WE LOOK FORWARD TO CELEBRATING WITH YOU</p>

      <p style="margin:0 0 1px;font-size:9px;font-weight:700;letter-spacing:0.2em;color:#fff;text-transform:uppercase;">Admitted Guest</p>
      <p style="margin:0 0 12px;font-size:17px;font-weight:900;color:#1a1a1a;text-transform:uppercase;">${fullName}</p>

      <p style="margin:0 0 3px;font-size:13px;color:#fff;"><strong>VENUE:</strong> <span style="color:#1a1a1a;">Nafowa Children's Park, Sam Ethan Airforce Base Ikeja.</span></p>

      <p style="margin:14px 0 0;font-size:13px;font-style:italic;font-weight:700;color:#1a1a1a;text-align:center;">Celebrating the Goodness of God.</p>
    </div>

    <p style="text-align:center;font-size:10px;color:#aaa;margin:8px 0 0;padding-bottom:12px;">This card is personal and non-transferable · One entry per card</p>
  </div>
</body>
</html>`,
    });
  } catch (err) {
    console.error('Email error:', err);
    await insertRsvp(fullName, email, phone, message, false);
    return NextResponse.json({ error: 'Failed to send confirmation email.' }, { status: 500 });
  }

  await insertRsvp(fullName, email, phone, message, true);

  console.log(`RSVP saved: ${fullName} | ${email}`);
  return NextResponse.json({ ok: true });
}
