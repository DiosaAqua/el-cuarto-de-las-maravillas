'use client';
import { useEffect } from 'react';

/**
 * Acceso oculto al panel. No se ve nada en la tienda.
 * Atajos: Ctrl + Alt + A  ·  o 5 clics seguidos sobre el texto de copyright del pie.
 * También se puede entrar escribiendo /admin en la barra de direcciones.
 */
export default function AdminBar() {
  useEffect(() => {
    const go = () => { window.location.href = '/admin'; };

    const onKey = (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); go(); }
    };
    let taps = 0, timer;
    const onClick = (e) => {
      if (!e.target.closest('[data-secret-admin]')) return;
      taps += 1;
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 1200);
      if (taps >= 5) { taps = 0; go(); }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
