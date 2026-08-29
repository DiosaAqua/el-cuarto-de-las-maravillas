'use client';
import { useMemo, useState } from 'react';
import { ActionForm, Submit } from '@/components/admin-ui';

/** Buscador + grilla de la biblioteca de imágenes. Con miles de archivos,
 *  cargar todo de una sola vez sería lento — filtra por nombre y usa carga
 *  perezosa (loading="lazy") para que el navegador sólo pida las que se ven. */
export default function MediaFilter({ items, deleteAction }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((it) => it.name.toLowerCase().includes(term));
  }, [items, q]);

  const copy = async (ruta) => {
    try { await navigator.clipboard.writeText(ruta); } catch {}
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 24 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre de archivo…"
          style={{ font: 'inherit', fontSize: 13.5, padding: '9px 12px', border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--text)', minWidth: 260 }}
        />
        <span className="muted" style={{ fontSize: 12.5 }}>{filtered.length} de {items.length}</span>
      </div>

      <div className="media" style={{ marginTop: 16 }}>
        {filtered.map(({ name, ruta, enUso }) => (
          <figure key={name}>
            <img src={ruta} alt={name} loading="lazy" decoding="async" />
            <figcaption>
              <div style={{ marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ruta}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10.5 }} onClick={() => copy(ruta)}>Copiar ruta</button>
                {enUso ? <span className="tag" style={{ fontSize: 9 }}>en uso</span> : (
                  <ActionForm action={deleteAction}>
                    <input type="hidden" name="name" value={name} />
                    <Submit variant="btn-ghost" style={{ padding: '4px 8px', fontSize: 10.5 }}>Eliminar</Submit>
                  </ActionForm>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
