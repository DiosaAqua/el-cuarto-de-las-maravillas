'use client';
import { useState } from 'react';

export default function Newsletter({ config }) {
  const [state, setState] = useState('idle');
  async function submit(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    setState(r.ok ? 'ok' : 'err');
    if (r.ok) e.target.reset();
    setTimeout(() => setState('idle'), 2600);
  }
  return (
    <section className="news wrap">
      <div className="kicker" style={{ color: 'color-mix(in srgb,var(--accent) 60%,var(--on-dark))', marginBottom: 14 }}>{config.kicker}</div>
      <h2 className="display">{config.title}</h2>
      <p>{config.copy}</p>
      <form onSubmit={submit}>
        <input type="email" name="email" required placeholder="tu@email.com" aria-label="Tu email" />
        <button className="btn btn-primary">{state === 'ok' ? 'Gracias ✓' : state === 'err' ? 'Revisá el email' : config.cta}</button>
      </form>
    </section>
  );
}
