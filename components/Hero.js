'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Hero({ slides }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length, i]);
  if (!slides.length) return null;
  const go = (n) => setI((n + slides.length) % slides.length);
  return (
    <section className="hero">
      {slides.map((s, k) => (
        <div className={'slide' + (k === i ? ' on' : '')} key={s.id}>
          <div className="shot"><img src={s.image} alt="" /><div className="shade" /></div>
          <div className="copy wrap">
            <div>
              <div className="kicker">{s.kicker}</div>
              <h1>{s.title1}<br />{s.title2}</h1>
              <p>{s.copy}</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href={s.href} className="btn btn-primary">{s.cta}</Link>
                <a href="#categorias" className="btn btn-light">Explorar categorías</a>
              </div>
            </div>
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <>
          <button className="arrow prev" style={{ left: 14 }} onClick={() => go(i - 1)} aria-label="Anterior">‹</button>
          <button className="arrow next" style={{ right: 14 }} onClick={() => go(i + 1)} aria-label="Siguiente">›</button>
          <div className="dots">
            {slides.map((s, k) => <button key={s.id} className={k === i ? 'on' : ''} onClick={() => go(k)} aria-label={'Slide ' + (k + 1)} />)}
          </div>
        </>
      )}
    </section>
  );
}
