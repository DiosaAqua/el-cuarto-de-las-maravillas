'use client';
import { useRef, useState } from 'react';
import ImageLibraryModal from './ImageLibraryModal';

/**
 * Selector de UNA imagen (banners, categorías, logo, fondo): subís una foto
 * nueva directo desde acá (se guarda al instante) o elegís de las que ya
 * subiste antes, en una ventana con buscador. Guarda la ruta elegida en un
 * input oculto.
 */
export default function SinglePicker({ name, defaultValue = '', library: initialLibrary = [], ratio = '16/10' }) {
  const [value, setValue] = useState(defaultValue || '');
  const [library, setLibrary] = useState(initialLibrary);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  const upload = async (files) => {
    if (!files.length) return;
    setError('');
    setUploading(true);
    try {
      const body = new FormData();
      [...files].slice(0, 1).forEach((f) => body.append('files', f));
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo subir la imagen.');
      setLibrary((l) => [...data.urls, ...l]);
      setValue(data.urls[0]);
    } catch (e) {
      setError(e.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className="f">
      <input type="hidden" name={name} value={value} />

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: 140 }}>
          {value ? (
            <img src={value} alt="" style={{ width: '100%', aspectRatio: ratio, objectFit: 'cover', background: 'var(--surface)' }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: ratio, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: 8 }}>Sin imagen</div>
          )}
        </div>
        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            className="dropzone"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
            style={{ padding: '14px 12px' }}
          >
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              style={{ display: 'none' }} onChange={(e) => upload(e.target.files)} />
            {uploading ? 'Subiendo…' : <>📷 Hacé clic o arrastrá una foto nueva</>}
          </div>
          {!!library.length && (
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, alignSelf: 'flex-start' }} onClick={() => setOpen(true)}>
              Elegir de las fotos ya subidas ({library.length})
            </button>
          )}
          {value && (
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, alignSelf: 'flex-start' }} onClick={() => setValue('')}>Quitar imagen</button>
          )}
          {error && <p className="err" style={{ margin: 0 }}>{error}</p>}
        </div>
      </div>

      {open && (
        <ImageLibraryModal
          library={library}
          selected={value ? new Set([value]) : null}
          onPick={(src) => { setValue(src); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
