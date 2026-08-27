'use client';
import { useState } from 'react';

/**
 * Filas editables sin sintaxis raras. Reemplaza los textareas con "clave | valor".
 * Envía los datos en un input oculto, una fila por línea, con | como separador.
 */
export default function Rows({ name, label, hint, rows: initial = [], cols, addLabel = '+ Agregar fila' }) {
  const [rows, setRows] = useState(initial.length ? initial : [cols.map(() => '')]);
  const set = (i, j, v) => setRows((r) => r.map((row, k) => (k === i ? row.map((c, l) => (l === j ? v : c)) : row)));
  const del = (i) => setRows((r) => r.filter((_, k) => k !== i));
  const add = () => setRows((r) => [...r, cols.map(() => '')]);
  const value = rows.filter((r) => r.some((c) => String(c).trim())).map((r) => r.join(' | ')).join('\n');

  return (
    <div className="f">
      <label>{label}{hint && <span className="hint"> — {hint}</span>}</label>
      <input type="hidden" name={name} value={value} />
      <div style={{ border: '1px solid var(--divider)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols.map((c) => c.width || '1fr').join(' ') + ' 44px', gap: 1, background: 'color-mix(in srgb,var(--text) 4%,transparent)', padding: '8px 10px' }}>
          {cols.map((c) => <span key={c.label} style={{ font: '600 10.5px/1 var(--font-ui)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{c.label}</span>)}
          <span />
        </div>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: cols.map((c) => c.width || '1fr').join(' ') + ' 44px', gap: 8, padding: '8px 10px', borderTop: '1px solid var(--divider)', alignItems: 'center' }}>
            {cols.map((c, j) => (
              <input key={j} value={row[j] || ''} placeholder={c.placeholder} onChange={(e) => set(i, j, e.target.value)}
                style={{ border: '1px solid var(--divider)', padding: '8px 10px', fontSize: 13.5 }} />
            ))}
            <button type="button" onClick={() => del(i)} title="Quitar esta fila"
              style={{ border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--accent)', cursor: 'pointer', padding: '8px 0', fontSize: 14 }}>×</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn btn-ghost" style={{ alignSelf: 'flex-start', marginTop: 8, fontSize: 12.5, padding: '9px 14px' }}>{addLabel}</button>
    </div>
  );
}
