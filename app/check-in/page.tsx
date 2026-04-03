'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Result {
  valid: boolean;
  name?: string;
  email?: string;
  reason?: string;
}

function CheckInInner() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setResult({ valid: false, reason: 'No QR token found.' });
      setLoading(false);
      return;
    }
    fetch(`/api/verify?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => { setResult(data); setLoading(false); })
      .catch(() => { setResult({ valid: false, reason: 'Verification failed.' }); setLoading(false); });
  }, [token]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Cinzel:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        .wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Lato', sans-serif;
          text-align: center;
        }
        .card {
          max-width: 420px;
          width: 100%;
          border: 1px solid;
          padding: 3rem 2.5rem;
          border-radius: 2px;
        }
        .card.valid   { border-color: #4caf7d; background: rgba(76,175,125,0.05); }
        .card.invalid { border-color: #e05252; background: rgba(224,82,82,0.05); }
        .card.loading { border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.03); }
        .icon { font-size: 3.5rem; margin-bottom: 1.2rem; display: block; }
        .status {
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .status.valid   { color: #4caf7d; }
        .status.invalid { color: #e05252; }
        .status.loading { color: #c9a84c; }
        .name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem;
          font-weight: 300;
          font-style: italic;
          color: #faf8f3;
          margin-bottom: 0.5rem;
        }
        .email {
          font-size: 0.85rem;
          color: rgba(250,248,243,0.5);
          letter-spacing: 0.05em;
        }
        .reason {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-style: italic;
          color: rgba(250,248,243,0.6);
        }
        .event-label {
          margin-top: 1.8rem;
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          letter-spacing: 0.4em;
          color: #c9a84c;
          text-transform: uppercase;
        }
      `}</style>

      <div className="wrap">
        {loading ? (
          <div className="card loading">
            <span className="icon">⏳</span>
            <div className="status loading">Verifying</div>
            <p className="reason">Checking your QR code…</p>
          </div>
        ) : result?.valid ? (
          <div className="card valid">
            <span className="icon">✅</span>
            <div className="status valid">Verified Guest</div>
            <div className="name">{result.name}</div>
            <div className="email">{result.email}</div>
            <div className="event-label">Maureen&apos;s 60th · 9 May 2026</div>
          </div>
        ) : (
          <div className="card invalid">
            <span className="icon">❌</span>
            <div className="status invalid">Not Valid</div>
            <p className="reason">{result?.reason || 'This QR code is not recognised.'}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default function CheckInPage() {
  return (
    <Suspense>
      <CheckInInner />
    </Suspense>
  );
}
