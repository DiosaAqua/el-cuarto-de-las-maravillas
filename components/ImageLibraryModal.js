'use client';
import { useMemo, useState } from 'react';

/** Ventana para elegir fotos ya subidas, con buscador. Con miles de archivos
 *  en la biblioteca, mostrarlos todos sueltos en la página la haría
 *  interminable — acá quedan contenidos en una ventana con scroll propio,
 *  y el buscador ayuda a encontrar la foto por nombre sin tener que scrollear. */
export default function ImageLibraryModal({ library, loading, selected, onPick, onClose, title = 'Elegí una foto' }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return library;
    return library.filter((src) => src.toLowerCase().includes(term));
  }, [library, q]);

  return (
    <div className="picker-bd" onClick={onClose}>
      <div className="picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="picker-head">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre…" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cerrar ✕</button>
        </div>
        <div className="picker-body media">
          {loading && <p className="muted" style={{ padding: 8 }}>Cargando…</p>}
          {!loading && filtered.map((src) => {
            const on = selected?.has(src);
            return (
              <figure key={src} onClick={() => onPick(src)} title={title}
                style={{ borderColor: on ? 'var(--accent)' : 'var(--divider)', borderWidth: on ? 3 : 1 }}>
                <img src={src} alt="" loading="lazy" decoding="async" />
              </figure>
            );
          })}
          {!loading && !filtered.length && <p className="muted" style={{ padding: 8 }}>Sin resultados para “{q}”.</p>}
        </div>
      </div>
    </div>
  );
}
