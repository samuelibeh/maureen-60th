'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const MESSAGE_LIMIT = 160;

const LOADING_PHRASES = [
  'Sending your card…',
  'Almost there…',
  'Sealing the envelope…',
  'Just a moment…',
];

interface Message {
  text: string;
  author: string;
  relation: string;
}

interface DbMessage {
  full_name: string;
  message: string;
  created_at: string;
}

const initialMessages: Message[] = [
  {
    text: "Mummy, you are the most beautiful soul I know — inside and out. Sixty years of you is sixty years of pure grace. I love you more than words can ever hold. Happy birthday, Mum.",
    author: "Neme Ben-Ibeh",
    relation: "Daughter",
  },
  {
    text: "Mum, watching you move through life with so much faith, elegance and love has taught me everything. Here's to you — our queen, our anchor, our greatest blessing. Happy 60th!",
    author: "Chisom Ben-Ibeh",
    relation: "Daughter",
  },
  {
    text: "Sixty years ago, God gave the world a gift. I have had the privilege of walking beside that gift every day since. You are my heart, my home, my everything. Happy birthday, my love.",
    author: "Benjamin Frank Ibeh",
    relation: "Husband",
  },
  {
    text: "Mum, you've always made every room warmer just by being in it. Thank you for your prayers, your sacrifices, and your love that never runs out. This one's for you — sixty and absolutely radiant. I love you.",
    author: "Ben-Ibeh Samuel",
    relation: "Son",
  },
];

export default function Maureen60th() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });
  const [celebrated, setCelebrated] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [showAllMessages, setShowAllMessages] = useState(false);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    let animFrame: number;

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x = 0; y = 0; size = 0; speed = 0; opacity = 0; drift = 0;
      constructor() { this.reset(true); }
      reset(init: boolean) {
        this.x = Math.random() * w;
        this.y = init ? Math.random() * h : h + 10;
        this.size = Math.random() * 1.5 + 0.3;
        this.speed = Math.random() * 0.4 + 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.drift = (Math.random() - 0.5) * 0.3;
      }
      update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.opacity += (Math.random() - 0.5) * 0.01;
        this.opacity = Math.max(0.05, Math.min(0.7, this.opacity));
        if (this.y < -10) this.reset(false);
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,168,76,${this.opacity})`;
        ctx!.fill();
      }
    }

    const particles = Array.from({ length: 80 }, () => new Particle());

    function loop() {
      ctx!.clearRect(0, 0, w, h);
      particles.forEach(p => { p.update(); p.draw(); });
      animFrame = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    const target = new Date('2026-05-09T13:00:00');
    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCelebrated(true); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0'),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);


  // Fetch guest messages from DB
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      const data: DbMessage[] = await res.json();
      if (data.length > 0) {
        const dbMessages = data.map(d => ({ text: d.message, author: d.full_name, relation: 'Guest' }));
        setMessages([...initialMessages, ...dbMessages]);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  async function handleRsvp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRsvpLoading(true);
    setRsvpError('');
    setLoadingPhrase(LOADING_PHRASES[0]);
    let phraseIndex = 0;
    const phraseInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % LOADING_PHRASES.length;
      setLoadingPhrase(LOADING_PHRASES[phraseIndex]);
    }, 1800);
    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem('firstName') as HTMLInputElement).value,
      lastName:  (form.elements.namedItem('lastName')  as HTMLInputElement).value,
      email:     (form.elements.namedItem('email')     as HTMLInputElement).value,
      phone:     (form.elements.namedItem('phone')     as HTMLInputElement).value,
      message:   (form.elements.namedItem('message')   as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        setRsvpError(err.error || 'Something went wrong. Please try again.');
      } else {
        setRsvpEmail(data.email);
        setRsvpPhone(data.phone);
        setRsvpSubmitted(true);
      }
    } catch {
      setRsvpError('Network error. Please check your connection and try again.');
    } finally {
      clearInterval(phraseInterval);
      setRsvpLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400&display=swap');

        :root {
          --black: #0a0a0a;
          --deep: #111111;
          --gold: #c9a84c;
          --gold-light: #e8c96d;
          --gold-pale: #f5e6b8;
          --white: #faf8f3;
          --white-dim: rgba(250,248,243,0.7);
          --white-ghost: rgba(250,248,243,0.1);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--black);
          color: var(--white);
          font-family: 'Lato', sans-serif;
          font-weight: 300;
          overflow-x: hidden;
        }
        #particles {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.4rem 4rem;
          background: linear-gradient(to bottom, rgba(10,10,10,0.95), transparent);
          border-bottom: 1px solid rgba(201,168,76,0.15);
        }
        .nav-logo {
          font-family: 'Cinzel', serif;
          font-size: 1rem;
          letter-spacing: 0.3em;
          color: var(--gold);
          text-transform: uppercase;
        }
        .nav-links {
          display: flex;
          gap: 2.5rem;
          list-style: none;
        }
        .nav-links a {
          font-family: 'Cinzel', serif;
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--white-dim);
          text-decoration: none;
          transition: color 0.3s;
        }
        .nav-links a:hover { color: var(--gold); }
        #hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6rem 2rem 4rem;
          z-index: 1;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 80% 100%, rgba(201,168,76,0.07) 0%, transparent 60%),
            linear-gradient(180deg, #0a0a0a 0%, #111108 50%, #0a0a0a 100%);
        }
        .hero-rule {
          width: 1px;
          height: 80px;
          background: linear-gradient(to bottom, transparent, var(--gold), transparent);
          margin-bottom: 2.5rem;
          animation: fadeDown 1.5s ease both;
        }
        .hero-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1.5rem;
          animation: fadeUp 1.2s 0.3s ease both;
        }
        .hero-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.3rem, 8vw, 7rem);
          font-weight: 300;
          font-style: italic;
          line-height: 0.9;
          color: var(--white);
          letter-spacing: -0.02em;
          animation: fadeUp 1.2s 0.5s ease both;
        }
        .hero-sixty {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.5rem, 5vw, 4rem);
          font-weight: 700;
          letter-spacing: 0.3em;
          color: var(--gold);
          margin-top: 0.3rem;
          animation: fadeUp 1.2s 0.7s ease both;
        }
        .hero-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.1rem, 2vw, 1.6rem);
          font-style: italic;
          color: var(--white-dim);
          margin-top: 1.8rem;
          animation: fadeUp 1.2s 0.9s ease both;
        }
        .hero-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2.5rem 0;
          animation: fadeUp 1.2s 1.1s ease both;
        }
        .hero-divider-line {
          width: 100px;
          height: 1px;
          background: linear-gradient(to right, transparent, var(--gold));
        }
        .hero-divider-line.right {
          background: linear-gradient(to left, transparent, var(--gold));
        }
        .hero-divider-diamond {
          width: 6px; height: 6px;
          background: var(--gold);
          transform: rotate(45deg);
        }
        .hero-date-block {
          display: flex;
          gap: 3rem;
          align-items: center;
          animation: fadeUp 1.2s 1.3s ease both;
          margin-bottom: 3rem;
        }
        .hero-date-item { text-align: center; }
        .hero-date-label {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          letter-spacing: 0.4em;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }
        .hero-date-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 300;
          color: var(--white);
        }
        .hero-date-sep {
          width: 1px;
          height: 50px;
          background: rgba(201,168,76,0.3);
        }
        .cta-btn {
          display: inline-block;
          padding: 1rem 3rem;
          border: 1px solid var(--gold);
          font-family: 'Cinzel', serif;
          font-size: 0.72rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--gold);
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: color 0.4s;
          animation: fadeUp 1.2s 1.5s ease both;
          cursor: pointer;
          background: transparent;
        }
        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gold);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
          z-index: -1;
        }
        .cta-btn:hover { color: var(--black); }
        .cta-btn:hover::before { transform: translateX(0); }
        section {
          position: relative;
          z-index: 1;
          padding: 7rem 2rem;
        }
        .section-inner {
          max-width: 900px;
          margin: 0 auto;
        }
        .section-label {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          letter-spacing: 0.6em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1rem;
          display: block;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 300;
          font-style: italic;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }
        .section-rule {
          width: 60px;
          height: 1px;
          background: var(--gold);
          margin-bottom: 2.5rem;
        }
        #details {
          background: linear-gradient(180deg, var(--black) 0%, #0e0d08 50%, var(--black) 100%);
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          margin-top: 3rem;
          border: 1px solid rgba(201,168,76,0.2);
        }
        .detail-card {
          padding: 3rem 2rem;
          text-align: center;
          border-right: 1px solid rgba(201,168,76,0.15);
          position: relative;
          overflow: hidden;
          transition: background 0.4s;
        }
        .detail-card:last-child { border-right: none; }
        .detail-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 50%; transform: translateX(-50%);
          width: 0; height: 2px;
          background: var(--gold);
          transition: width 0.4s ease;
        }
        .detail-card:hover { background: rgba(201,168,76,0.04); }
        .detail-card:hover::after { width: 60%; }
        .detail-icon { font-size: 1.5rem; margin-bottom: 1rem; display: block; }
        .detail-title {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          letter-spacing: 0.4em;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 0.8rem;
        }
        .detail-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 300;
          line-height: 1.4;
          color: var(--white);
        }
        .detail-sub {
          font-size: 0.8rem;
          color: var(--white-dim);
          margin-top: 0.4rem;
          letter-spacing: 0.05em;
        }
        .dresscode-block {
          margin-top: 4rem;
          border: 1px solid rgba(201,168,76,0.25);
          padding: 2.5rem 3rem;
          display: flex;
          align-items: center;
          gap: 2rem;
          background: rgba(201,168,76,0.03);
          position: relative;
          overflow: hidden;
        }
        .dresscode-block::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, transparent, var(--gold), transparent);
        }
        .dresscode-swatches { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .swatch {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .swatch-black { background: #0a0a0a; border-color: rgba(201,168,76,0.4); }
        .swatch-gold { background: linear-gradient(135deg, #c9a84c, #e8c96d); }
        .swatch-white { background: #faf8f3; }
        .dresscode-text .label {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          letter-spacing: 0.4em;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 0.4rem;
          display: block;
        }
        .dresscode-text p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-style: italic;
          color: var(--white);
        }
        #rsvp {
          background:
            radial-gradient(ellipse 70% 50% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%),
            var(--black);
        }
        .rsvp-form { max-width: 620px; margin: 3rem auto 0; }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .form-group { display: flex; flex-direction: column; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.6rem;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          background: rgba(250,248,243,0.04);
          border: 1px solid rgba(201,168,76,0.25);
          color: var(--white);
          font-family: 'Lato', sans-serif;
          font-weight: 300;
          font-size: 0.9rem;
          padding: 0.85rem 1.1rem;
          outline: none;
          transition: border-color 0.3s, background 0.3s;
          width: 100%;
          appearance: none;
        }
        .form-group select option { background: #1a1a0e; color: var(--white); }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--gold);
          background: rgba(201,168,76,0.05);
        }
        .form-group input::placeholder,
        .form-group textarea::placeholder { color: rgba(250,248,243,0.3); }
        .form-group textarea { resize: vertical; min-height: 120px; }
        .submit-btn {
          width: 100%;
          padding: 1.1rem;
          background: transparent;
          border: 1px solid var(--gold);
          color: var(--gold);
          font-family: 'Cinzel', serif;
          font-size: 0.75rem;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: color 0.4s;
          margin-top: 0.5rem;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gold);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
          z-index: -1;
        }
        .submit-btn:hover { color: var(--black); }
        .submit-btn:hover::before { transform: scaleX(1); }
        .success-msg {
          text-align: center;
          padding: 2rem;
          border: 1px solid rgba(201,168,76,0.3);
          margin-top: 2rem;
          background: rgba(201,168,76,0.05);
        }
        .success-msg .success-icon { font-size: 2rem; display: block; margin-bottom: 1rem; }
        .success-msg h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-style: italic;
          color: var(--gold);
          margin-bottom: 0.5rem;
        }
        .success-msg p { color: var(--white-dim); font-size: 0.9rem; }
        #messages { background: #080808; }
        .messages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
        }
        .message-card {
          border: 1px solid rgba(201,168,76,0.15);
          padding: 2rem;
          position: relative;
          background: rgba(201,168,76,0.02);
          transition: border-color 0.3s, transform 0.3s;
          overflow: hidden;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .message-card:hover {
          border-color: rgba(201,168,76,0.4);
          transform: translateY(-4px);
        }
        .message-card::before {
          content: '"';
          position: absolute;
          top: 0.5rem; left: 1rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 5rem;
          color: rgba(201,168,76,0.12);
          line-height: 1;
        }
        .message-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          font-style: italic;
          line-height: 1.7;
          color: var(--white-dim);
          margin-bottom: 1.2rem;
          word-break: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
        }
        .message-author {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          color: var(--gold);
        }
        .message-form { max-width: 620px; margin: 3rem auto 0; }
        .countdown-wrap {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-top: 4rem;
          flex-wrap: wrap;
        }
        .countdown-unit { text-align: center; min-width: 80px; }
        .countdown-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.5rem;
          font-weight: 300;
          color: var(--gold);
          display: block;
          line-height: 1;
        }
        .countdown-label {
          font-family: 'Cinzel', serif;
          font-size: 0.55rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--white-dim);
          margin-top: 0.4rem;
          display: block;
        }
        .countdown-sep {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          color: rgba(201,168,76,0.3);
          align-self: flex-start;
          padding-top: 0.2rem;
        }
        footer {
          border-top: 1px solid rgba(201,168,76,0.15);
          padding: 3rem 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .footer-logo {
          font-family: 'Cinzel', serif;
          font-size: 1.2rem;
          letter-spacing: 0.3em;
          color: var(--gold);
        }
        .footer-copy {
          font-size: 0.75rem;
          color: rgba(250,248,243,0.3);
          letter-spacing: 0.1em;
        }
        .footer-links { display: flex; gap: 2rem; list-style: none; }
        .footer-links a {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          color: var(--white-dim);
          text-decoration: none;
          transition: color 0.3s;
        }
        .footer-links a:hover { color: var(--gold); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 40%, var(--gold) 60%, var(--gold-pale) 80%, var(--gold) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 768px) {
          nav { padding: 1rem 1.5rem; }
          .nav-links { display: none; }
          .details-grid { grid-template-columns: 1fr; }
          .detail-card { border-right: none; border-bottom: 1px solid rgba(201,168,76,0.15); }
          .form-row { grid-template-columns: 1fr; }
          footer { flex-direction: column; gap: 1.5rem; text-align: center; }
          .dresscode-block { flex-direction: column; text-align: center; }
        }
      `}</style>

      <canvas id="particles" ref={canvasRef} />

      {/* NAV */}
      <nav>
        <div className="nav-logo">Maureen Ben-Ibeh · 60</div>
        <ul className="nav-links">
          <li><a href="#details">The Event</a></li>
          <li><a href="#rsvp">RSVP</a></li>
          <li><a href="#messages">Messages</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-bg" />
        <div className="hero-rule" />
        <span className="hero-eyebrow">You are cordially invited to celebrate</span>
        <h1 className="hero-name" style={{ color: 'var(--gold)' }}>Maureen Ben-Ibeh&apos;s</h1>
        <div className="hero-sixty">
          60<sup style={{ fontSize: '0.5em', verticalAlign: 'super' }}>th</sup> Birthday
        </div>
        <p className="hero-tagline">Six decades of grace, love &amp; radiant living</p>

        <div className="hero-divider">
          <div className="hero-divider-line" />
          <div className="hero-divider-diamond" />
          <div className="hero-divider-line right" />
        </div>

        <div className="hero-date-block">
          <div className="hero-date-item">
            <div className="hero-date-label">Date</div>
            <div className="hero-date-value">Saturday, 9 May</div>
          </div>
          <div className="hero-date-sep" />
          <div className="hero-date-item">
            <div className="hero-date-label">Time</div>
            <div className="hero-date-value">1:00 PM</div>
          </div>
          <div className="hero-date-sep" />
          <div className="hero-date-item">
            <div className="hero-date-label">Year</div>
            <div className="hero-date-value">2026</div>
          </div>
        </div>

        <a href="#rsvp" className="cta-btn">Reserve Your Seat</a>

        {/* Countdown */}
        <div className="countdown-wrap">
          {celebrated ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontStyle: 'italic', color: 'var(--gold)' }}>
              The celebration is today! 🎉
            </p>
          ) : (
            <>
              <div className="countdown-unit">
                <span className="countdown-num">{countdown.days}</span>
                <span className="countdown-label">Days</span>
              </div>
              <div className="countdown-sep">:</div>
              <div className="countdown-unit">
                <span className="countdown-num">{countdown.hours}</span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-sep">:</div>
              <div className="countdown-unit">
                <span className="countdown-num">{countdown.mins}</span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-sep">:</div>
              <div className="countdown-unit">
                <span className="countdown-num">{countdown.secs}</span>
                <span className="countdown-label">Seconds</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* EVENT DETAILS */}
      <section id="details">
        <div className="section-inner">
          <div className="reveal">
            <span className="section-label">Event Details</span>
            <h2 className="section-title">An Evening to Remember</h2>
            <div className="section-rule" />
            <p style={{ color: 'var(--white-dim)', lineHeight: 1.8, maxWidth: 560 }}>
              Join us as we celebrate sixty magnificent years of a woman who has touched every life she has entered. Come dressed in your finest and ready to celebrate in grand style.
            </p>
          </div>

          <div className="details-grid reveal" style={{ transitionDelay: '0.15s' }}>
            <div className="detail-card">
              <span className="detail-icon">📅</span>
              <div className="detail-title">Date</div>
              <div className="detail-value">Saturday<br />9th May, 2026</div>
            </div>
            <div className="detail-card">
              <span className="detail-icon">🕐</span>
              <div className="detail-title">Time</div>
              <div className="detail-value">1:00 PM</div>
              <div className="detail-sub">Doors open at 12:30 PM</div>
            </div>
            <div className="detail-card">
              <span className="detail-icon">📍</span>
              <div className="detail-title">Venue</div>
              <div className="detail-value">NAFOWA Children&apos;s Park</div>
              <div className="detail-sub">Sam Ethan Airforce Base, Ikeja, Lagos</div>
            </div>
          </div>

          <div className="dresscode-block reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="dresscode-swatches">
              <div className="swatch swatch-black" />
              <div className="swatch swatch-gold" />
              <div className="swatch swatch-white" />
            </div>
            <div className="dresscode-text">
              <span className="label">Dress Code</span>
              <p>White — Come draped in elegance. All-white attire required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp">
        <div className="section-inner">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <span className="section-label">Kindly Respond</span>
            <h2 className="section-title">Reserve Your Seat</h2>
            <div className="section-rule" style={{ margin: '0 auto 2rem' }} />
            <p style={{ color: 'var(--white-dim)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
              Please complete the form below to confirm your attendance at Maureen Ben-Ibeh&apos;s 60th birthday celebration.<br />
              <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontStyle: 'italic' }}>Your access card will be sent to your email. (Note: The card is not strictly required for attendance).</span>
            </p>
          </div>

          {!rsvpSubmitted ? (
            <form className="rsvp-form reveal" style={{ transitionDelay: '0.2s' }} onSubmit={handleRsvp}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" type="text" placeholder="Your first name" required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" type="text" placeholder="Your last name" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input name="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" type="tel" placeholder="+234 000 000 0000" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full">
                  <label>A Birthday Message (Optional)</label>
                  <textarea name="message" placeholder="Share a warm wish, a favourite memory, or a prayer for Mum..." maxLength={400} />
                </div>
              </div>
              {rsvpError && (
                <p style={{ color: '#e05252', fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                  {rsvpError}
                </p>
              )}
              <button type="submit" className="submit-btn" disabled={rsvpLoading}>
                {rsvpLoading ? loadingPhrase : 'Confirm Attendance'}
              </button>
            </form>
          ) : (
            <div className="success-msg">
              <span className="success-icon">✦</span>
              <h3>You&apos;re confirmed!</h3>
              <p>
                Your access card has been sent to <strong style={{ color: 'var(--gold)' }}>{rsvpEmail}</strong>.<br />
                While the card is a beautiful memento, you do not need to present it to gain entry.<br /><br />
                Dress code: <strong style={{ color: 'var(--gold)' }}>White</strong>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* MESSAGES */}
      <section id="messages">
        <div className="section-inner">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <span className="section-label">Family &amp; Friends</span>
            <h2 className="section-title">Heartfelt Wishes</h2>
            <div className="section-rule" style={{ margin: '0 auto 2rem' }} />
            <p style={{ color: 'var(--white-dim)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
              Words from the people who love her most — cherished forever.
            </p>
          </div>

          <div className="messages-grid reveal" style={{ transitionDelay: '0.2s' }}>
            {(showAllMessages ? messages : messages.slice(0, 6)).map((msg, i) => {
              const isLong = msg.text.length > MESSAGE_LIMIT;
              const expanded = expandedCards[i] || false;
              return (
                <div className="message-card" key={i}>
                  <p className="message-text">
                    {isLong && !expanded ? msg.text.slice(0, MESSAGE_LIMIT) + '…' : msg.text}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => setExpandedCards(prev => ({ ...prev, [i]: !prev[i] }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontFamily: "'Cinzel', serif", fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0', marginBottom: '0.8rem' }}
                    >
                      {expanded ? 'See less ▲' : 'See more ▼'}
                    </button>
                  )}
                  <div className="message-author">— {msg.author}</div>
                </div>
              );
            })}
          </div>

          {messages.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={() => setShowAllMessages(prev => !prev)}
                className="cta-btn"
                style={{ animation: 'none' }}
              >
                {showAllMessages ? 'Show Less ▲' : `See All ${messages.length} Messages ▼`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Maureen Ben-Ibeh · 60th</div>
        <div className="footer-copy">9 May 2026 · Ikeja, Lagos · Dress Code: White</div>
        <ul className="footer-links">
          <li><a href="#hero">Top</a></li>
          <li><a href="#details">Details</a></li>
          <li><a href="#rsvp">RSVP</a></li>
          <li><a href="#messages">Messages</a></li>
        </ul>
      </footer>
    </>
  );
}
