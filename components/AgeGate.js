'use client';
import { useEffect, useState } from 'react';

export default function AgeGate({ config }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (config?.enabled && localStorage.getItem('velure.age') !== 'ok') setShow(true);
  }, [config]);
  if (!show) return null;
  return (
    <div className="agegate">
      <div>
        <h2 className="display">{config.title}</h2>
        <p style={{ maxWidth: 420, margin: '0 auto 26px', color: 'color-mix(in srgb,var(--on-dark) 78%,transparent)' }}>{config.copy}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => { localStorage.setItem('velure.age', 'ok'); setShow(false); }}>{config.confirm}</button>
          <a className="btn btn-light" href="https://www.google.com">{config.deny}</a>
        </div>
      </div>
    </div>
  );
}
