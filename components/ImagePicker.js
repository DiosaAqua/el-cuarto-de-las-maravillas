'use client';
import { useRef, useState } from 'react';

/**
 * Selector de imágenes del producto: subís fotos nuevas directo desde acá
 * (se guardan al instante) o elegís de las que ya subiste antes. Guarda las
 * rutas en un input oculto, una por línea (lo que espera la action).
 */
export default function ImagePicker({ name, defaultValue = [], library: initialLibrary = [] }) {
  const [sel, setSel] = useState(defaultValue.filter(Boolean));
  const [library, setLibrary] = useState(initialLibrary);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  const toggle = (src) => setSel((s) => (s.includes(src) ? s.filter((x) => x !== src) : [...s, src]));
  const move = (i, d) => setSel((s) => {
    const n = [...s]; const j = i + d;
    if (j < 0 || j >= n.length) return n;
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  });

  const upload = async (files) => {
    if (!files.length) return;
    setError('');
    setUploading(true);
    try {
      const body = new FormData();
      [...files].forEach((f) => body.append('files', f));
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo subir la imagen.');
      setLibrary((l) => [...data.urls, ...l]);
      setSel((s) => [...s, ...data.urls]);
    } catch (e) {
      setError(e.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className="f">
      <label>Fotos del producto</label>
      <input type="hidden" name={name} value={sel.join('\n')} />

      <div
        className="dropzone"
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
      >
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple
          style={{ display: 'none' }} onChange={(e) => upload(e.target.files)} />
        {uploading ? 'Subiendo…' : <>📷 Hacé clic acá o arrastrá las fotos — se suben y se agregan solas</>}
      </div>
      {error && <p className="err" style={{ marginTop: 8 }}>{error}</p>}

      {!!sel.length && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 12, border: '2px solid var(--divider)', margin: '14px 0 0' }}>
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

      {!!library.length && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: 'pointer', fontSize: 12.5, color: 'var(--muted)' }}>O elegí una foto que ya subiste antes ({library.length})</summary>
          <div className="media" style={{ marginTop: 12 }}>
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
        </details>
      )}
    </div>
  );
}
