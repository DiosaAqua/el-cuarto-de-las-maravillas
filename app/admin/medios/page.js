import { guard } from '../guard';
import * as db from '@/lib/db';
import { listImages } from '@/lib/storage';
import { uploadImages, deleteImage } from '../actions';
import { ActionForm, Submit } from '@/components/admin-ui';
import MediaFilter from '@/components/MediaFilter';

/** Junta todas las rutas /uploads/... usadas en productos y en el sitio,
 *  recorriendo los datos en vez de convertirlos a texto — con miles de
 *  productos, buscar cada imagen dentro de un texto gigante es lentísimo. */
function collectUsedImages(products, site) {
  const used = new Set();
  for (const p of products) for (const img of p.images || []) if (img) used.add(img);
  const walk = (v) => {
    if (typeof v === 'string') { if (v.startsWith('/uploads/')) used.add(v); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(site);
  return used;
}

export default async function Medios() {
  await guard('media');
  const [files, products, site] = await Promise.all([listImages(), db.read('products'), db.read('site')]);
  const used = collectUsedImages(products, site);
  const items = files.map((x) => ({ name: x.name, ruta: '/uploads/' + x.name, enUso: used.has('/uploads/' + x.name) }));

  return (
    <>
      <h1>Imágenes</h1>
      <p className="sub">{items.length} archivo(s) en /uploads. Copiá la ruta y pegala en el producto o la sección — o elegilas directamente desde el selector de fotos en cada formulario.</p>

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

      <MediaFilter items={items} deleteAction={deleteImage} />
    </>
  );
}
