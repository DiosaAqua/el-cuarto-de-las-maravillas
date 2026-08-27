'use client';
import { useState } from 'react';

/**
 * Selector de imágenes por clic: elegís de la biblioteca /uploads y ordenás.
 * Guarda las rutas en un input oculto, una por línea (lo que espera la action).
 */
export default function ImagePicker({ name, defaultValue = [], library = [] }) {
  const [sel, setSel] = useState(defaultValue.filter(Boolean));
  const toggle = (src) => setSel((s) => (s.includes(src) ? s.filter((x) => x !== src) : [...s, src]));
  const move = (i, d) => setSel((s) => {
    const n = [...s]; const j = i + d;
    if (j < 0 || j >= n.length) return n;
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  });

  return (
    <div className="f">
      <label>Galería del producto <span className="hint">— hacé clic en las fotos que querés usar</span></label>
      <input type="hidden" name={name} value={sel.join('\n')} />

      {!!sel.length && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 12, border: '2px solid var(--divider)', marginBottom: 12 }}>
          {sel.map((src, i) => (
            <div key={src + i} style={{ width: 96 }}>
              <img src={src} alt="" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', background: 'var(--surface)' }} />
              <div style={{ fontSize: 10.5, color: 'var(--muted)', padding: '4px 0' }}>{i === 0 ? 'Principal' : i === 1 ? 'Al pasar el mouse' : 'Galería ' + (i + 1)}</div>
              <div style={{ display: 'flex', gap: 3 }}>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Mover antes"
                  style={{ flex: 1, border: '1px solid var(--divider)', background: 'var(--bg)', cursor: 'pointer', fontSize: 12, padding: '4px 0', color: 'var(--text)' }}>←</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === sel.length - 1} title="Mover después"
                  style={{ flex: 1, border: '1px solid var(--divider)', background: 'var(--bg)', cursor: 'pointer', fontSize: 12, padding: '4px 0', color: 'var(--text)' }}>→</button>
                <button type="button" onClick={() => toggle(src)} title="Quitar"
                  style={{ flex: 1, border: '1px solid var(--divider)', background: 'var(--bg)', cursor: 'pointer', fontSize: 12, padding: '4px 0', color: 'var(--accent)' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="media">
        {library.map((src) => {
          const on = sel.includes(src);
          return (
            <figure key={src} onClick={() => toggle(src)} title={on ? 'Quitar de la galería' : 'Agregar a la galería'}
              style={{ cursor: 'pointer', borderColor: on ? 'var(--accent)' : 'var(--divider)', borderWidth: on ? 3 : 1, position: 'relative' }}>
              <img src={src} alt="" />
              {on && <span style={{ position: 'absolute', top: 6, left: 6, background: 'var(--accent)', color: '#fff', font: '700 10px/1 var(--font-ui)', padding: '4px 6px' }}>{sel.indexOf(src) + 1}</span>}
            </figure>
          );
        })}
      </div>
      {!library.length && <span className="hint">Todavía no subiste imágenes. Andá a “Imágenes” en el menú y cargá las fotos.</span>}
    </div>
  );
}
