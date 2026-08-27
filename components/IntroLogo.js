'use client';
import { useEffect, useState } from 'react';

/**
 * Splash de bienvenida: el logo aparece grande y centrado, y se achica hasta
 * encajar exactamente sobre el logo real del header (técnica FLIP con rects
 * reales, no valores fijos). Una vez por sesión de pestaña.
 *
 * El "reclamo" de sessionStorage se hace recién dentro del IIFE async, después
 * del primer punto donde se chequea `cancelled` — así sobrevive al doble
 * efecto de React Strict Mode en desarrollo (monta→limpia→monta): la primera
 * pasada se cancela antes de reclamar nada, y sólo la que queda en pie llega
 * a arrancar la animación.
 */
export default function IntroLogo({ brand }) {
  const [phase, setPhase] = useState('off'); // off | show | fly
  const [rect, setRect] = useState(null);
  const [start, setStart] = useState(null);

  useEffect(() => {
    if (!brand?.logoImage) return;
    if (sessionStorage.getItem('intro.shown') === '1') return;

    let cancelled = false;
    const waitAgeGate = () => new Promise((resolve) => {
      const check = () => {
        if (cancelled) return resolve();
        const blocked = document.querySelector('.agegate');
        if (!blocked) return resolve();
        setTimeout(check, 200);
      };
      check();
    });

    (async () => {
      await waitAgeGate();
      if (cancelled) return;
      sessionStorage.setItem('intro.shown', '1');

      const size = Math.max(240, Math.min(460, Math.min(window.innerWidth, window.innerHeight) * 0.62));
      setStart({ w: size, h: size });
      setPhase('show');
      await new Promise((r) => setTimeout(r, 1000));
      if (cancelled) return;
      const target = document.querySelector('.headrow .brandmark img');
      if (!target) { setPhase('off'); return; }
      const box = target.getBoundingClientRect();
      setRect(box);
      requestAnimationFrame(() => setPhase('fly'));
      await new Promise((r) => setTimeout(r, 1100));
      if (cancelled) return;
      setPhase('off');
    })();

    return () => { cancelled = true; };
  }, [brand]);

  if (phase === 'off' || !start) return null;

  const flying = phase === 'fly' && rect;
  const style = flying
    ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    : {
        top: window.innerHeight / 2 - start.h / 2,
        left: window.innerWidth / 2 - start.w / 2,
        width: start.w,
        height: start.h,
      };

  return (
    <div className={'intro-logo' + (flying ? ' fly' : '')} aria-hidden>
      <img src={brand.logoImage} alt="" style={style} />
    </div>
  );
}
