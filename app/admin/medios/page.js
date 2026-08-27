import { guard } from '../guard';
import * as db from '@/lib/db';
import { listImages } from '@/lib/storage';
import { uploadImages, deleteImage } from '../actions';
import { ActionForm, Submit } from '@/components/admin-ui';

export default async function Medios() {
  await guard('media');
  const files = (await listImages()).map((x) => x.name);
  const used = JSON.stringify(await db.read('products')) + JSON.stringify(await db.read('site'));
  return (
    <>
      <h1>Imágenes</h1>
      <p className="sub">{files.length} archivo(s) en /uploads. Copiá la ruta y pegala en el producto o la sección.</p>

      <ActionForm action={uploadImages}>
        <fieldset className="fs">
          <legend>Subir</legend>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
            <input type="file" name="files" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              style={{ font: 'inherit', fontSize: 13.5 }} />
            <Submit>Subir imágenes</Submit>
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>JPG, PNG, WebP, AVIF o GIF · hasta 6 MB cada una. Recomendado 1600×2000 px para producto y 2400×1400 px para el hero.</p>
        </fieldset>
      </ActionForm>

      <div className="media" style={{ marginTop: 24 }}>
        {files.map((n) => {
          const ruta = '/uploads/' + n;
          const enUso = used.includes(ruta);
          return (
            <figure key={n}>
              <img src={ruta} alt={n} />
              <figcaption>
                <div style={{ marginBottom: 6 }}>{ruta}</div>
                {enUso ? <span className="tag" style={{ fontSize: 9 }}>en uso</span> : (
                  <ActionForm action={deleteImage}>
                    <input type="hidden" name="name" value={n} />
                    <Submit variant="btn-ghost" style={{ padding: '4px 8px', fontSize: 10.5 }}>Eliminar</Submit>
                  </ActionForm>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </>
  );
}
