'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Splash de bienvenida: el logo aparece grande y centrado, y se achica hasta
 * encajar exactamente sobre el logo real del header (técnica FLIP con rects
 * reales, no valores fijos). Una vez por sesión de pestaña.
 */
export default function IntroLogo({ brand }) {
  const [phase, setPhase] = useState('off'); // off | show | fly
  const [rect, setRect] = useState(null);
  const started = useRef(false);

  useEffect(() => {
    if (!brand?.logoImage) return;
    if (started.current) return;
    if (sessionStorage.getItem('intro.shown') === '1') return;
    started.current = true;
    sessionStorage.setItem('intro.shown', '1');

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
      setPhase('show');
      await new Promise((r) => setTimeout(r, 850));
      if (cancelled) return;
      const target = document.querySelector('.headrow .brandmark img');
      if (!target) { setPhase('off'); return; }
      const box = target.getBoundingClientRect();
      setRect(box);
      requestAnimationFrame(() => setPhase('fly'));
      await new Promise((r) => setTimeout(r, 900));
      if (cancelled) return;
      setPhase('off');
    })();

    return () => { cancelled = true; };
  }, [brand]);

  if (phase === 'off') return null;

  const flying = phase === 'fly' && rect;
  const start = { w: 130, h: 130 };
  const style = flying
    ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    : {
        top: (typeof window !== 'undefined' ? window.innerHeight / 2 : 0) - start.h / 2,
        left: (typeof window !== 'undefined' ? window.innerWidth / 2 : 0) - start.w / 2,
        width: start.w,
        height: start.h,
      };

  return (
    <div className={'intro-logo' + (flying ? ' fly' : '')} aria-hidden>
      <img src={brand.logoImage} alt="" style={style} />
    </div>
  );
}
