import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guard } from '../../guard';
import * as db from '@/lib/db';
import { saveProduct } from '../../actions';
import { ActionForm, Submit, Text, Area, Check, Field } from '@/components/admin-ui';
import RichText from '@/components/RichText';
import ImagePicker from '@/components/ImagePicker';
import Rows from '@/components/Rows';

export default async function EditarProducto({ params }) {
  await guard('products');
  const site = await db.read('site');
  const nuevo = params.id === 'nuevo';
  const p = nuevo ? null : (await db.read('products')).find((x) => x.id === params.id);
  if (!nuevo && !p) notFound();
  const v = p || { images: [], specs: [], published: true, installments: 1, stock: 0, category: site.categories[0]?.id, brand: site.brands[0] };
  return (
    <>
      <h1>{nuevo ? 'Nuevo producto' : v.name}</h1>
      <p className="sub">
        <Link href="/admin/productos">← Volver al listado</Link>
        {!nuevo && <> · <Link href={'/producto/' + v.slug} target="_blank">Ver en la tienda ↗</Link></>}
      </p>

      <ActionForm action={saveProduct}>
        <input type="hidden" name="id" value={nuevo ? '' : v.id} />

        <fieldset className="fs">
          <legend>Datos básicos</legend>
          <div className="grid2">
            <Text label="Nombre" name="name" defaultValue={v.name || ''} required />
            <Text label="Slug (URL)" name="slug" defaultValue={v.slug || ''} hint="se genera solo si lo dejás vacío" />
            <Field label="Categoría">
              <select name="category" defaultValue={v.category}>
                {site.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Marca">
              <select name="brand" defaultValue={v.brand}>
                {site.brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Text label="SKU" name="sku" defaultValue={v.sku || ''} />
            <Text label="Etiqueta" name="badge" defaultValue={v.badge || ''} hint="Novedad, Oferta, Best seller…" />
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Precio y stock</legend>
          <div className="grid3">
            <Text label="Precio" name="price" type="number" min="0" step="1" defaultValue={v.price ?? ''} required />
            <Text label="Precio anterior" name="oldPrice" type="number" min="0" step="1" defaultValue={v.oldPrice ?? ''} hint="para mostrar el % off" />
            <Text label="Stock" name="stock" type="number" min="0" step="1" defaultValue={v.stock ?? 0} />
            <Text label="Cuotas sin interés" name="installments" type="number" min="1" max="24" defaultValue={v.installments ?? 1} />
          </div>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginTop: 16 }}>
            <Check label="Envío gratis" name="freeShipping" defaultChecked={v.freeShipping} />
            <Check label="Destacado en el inicio" name="featured" defaultChecked={v.featured} />
            <Check label="Publicado" name="published" defaultChecked={v.published} />
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Textos</legend>
          <div style={{ display: 'grid', gap: 16 }}>
            <Area label="Descripción corta" name="shortDescription" defaultValue={v.shortDescription || ''}
              style={{ minHeight: 70 }} hint="una línea, aparece bajo el título" />
            <RichText name="description" label="Descripción completa" defaultValue={v.description || ''} minHeight={210}
              hint="usá los botones para negrita, listas y subtítulos" />
            <Rows name="specs" label="Especificaciones" hint="se muestran como tabla en la ficha"
              cols={[{ label: 'Dato', placeholder: 'Material', width: '220px' }, { label: 'Valor', placeholder: 'Silicona de grado médico' }]}
              rows={(v.specs || []).map((s) => [s.k, s.v])} addLabel="+ Agregar especificación" />
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Fotos</legend>
          <ImagePicker name="images" defaultValue={v.images || []} />
        </fieldset>

        <div className="bar"><Submit>{nuevo ? 'Crear producto' : 'Guardar cambios'}</Submit>
          <Link className="btn btn-ghost" href="/admin/productos">Cancelar</Link></div>
      </ActionForm>
    </>
  );
}
