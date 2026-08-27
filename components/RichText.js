'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Editor de texto con formato, sin dependencias.
 * Escribe el HTML resultante en un input oculto para que lo lea la server action.
 * Pensado para quien no sabe HTML: se escribe como en Word.
 */
const BTNS = [
  { cmd: 'bold', label: 'N', title: 'Negrita', style: { fontWeight: 700 } },
  { cmd: 'italic', label: 'C', title: 'Cursiva', style: { fontStyle: 'italic' } },
  { cmd: 'formatBlock', arg: 'h3', label: 'Título', title: 'Subtítulo' },
  { cmd: 'formatBlock', arg: 'p', label: 'Párrafo', title: 'Texto normal' },
  { cmd: 'insertUnorderedList', label: '• Lista', title: 'Lista con viñetas' },
  { cmd: 'insertOrderedList', label: '1. Lista', title: 'Lista numerada' },
  { cmd: 'createLink', label: 'Link', title: 'Insertar un link' },
  { cmd: 'removeFormat', label: 'Limpiar', title: 'Quitar el formato' },
];

export default function RichText({ name, defaultValue = '', label, hint, minHeight = 200 }) {
  const box = useRef(null);
  const [html, setHtml] = useState(defaultValue);
  const [source, setSource] = useState(false);

  useEffect(() => {
    if (box.current && !source) box.current.innerHTML = defaultValue || '<p></p>';
  }, [defaultValue, source]);

  const run = (b) => {
    if (b.cmd === 'createLink') {
      const url = window.prompt('¿A qué dirección lleva el link?', 'https://');
      if (!url) return;
      document.execCommand('createLink', false, url);
    } else {
      document.execCommand(b.cmd, false, b.arg || null);
    }
    box.current?.focus();
    setHtml(box.current?.innerHTML || '');
  };

  return (
    <div className="f">
      <label>
        {label}
        {hint && <span className="hint"> — {hint}</span>}
      </label>
      <input type="hidden" name={name} value={html} />
      <div style={{ border: '1px solid var(--divider)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 6, borderBottom: '1px solid var(--divider)', background: 'color-mix(in srgb,var(--text) 4%,transparent)' }}>
          {BTNS.map((b) => (
            <button type="button" key={b.label} title={b.title} onClick={() => run(b)}
              style={{ font: '600 12px/1 var(--font-ui)', padding: '7px 10px', border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', ...b.style }}>
              {b.label}
            </button>
          ))}
          <button type="button" onClick={() => { setSource((v) => !v); }} title="Ver el código HTML"
            style={{ font: '600 12px/1 var(--font-ui)', padding: '7px 10px', marginLeft: 'auto', border: '1px solid var(--divider)', background: source ? 'var(--accent)' : 'var(--bg)', color: source ? '#fff' : 'var(--muted)', cursor: 'pointer' }}>
            HTML
          </button>
        </div>
        {source ? (
          <textarea value={html} onChange={(e) => setHtml(e.target.value)}
            style={{ border: 0, minHeight, fontFamily: 'ui-monospace,monospace', fontSize: 13, width: '100%' }} />
        ) : (
          <div ref={box} contentEditable suppressContentEditableWarning
            onInput={(e) => setHtml(e.currentTarget.innerHTML)}
            onBlur={(e) => setHtml(e.currentTarget.innerHTML)}
            style={{ minHeight, padding: '14px 16px', fontSize: 14.5, lineHeight: 1.6, outline: 'none' }} />
        )}
      </div>
      <span className="hint">Escribí normal y usá los botones para dar formato. No necesitás saber HTML.</span>
    </div>
  );
}
