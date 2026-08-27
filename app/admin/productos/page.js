import Link from 'next/link';
import { guard } from '../guard';
import * as db from '@/lib/db';
import { ARS } from '@/lib/format';
import { ActionForm, Submit } from '@/components/admin-ui';
import { deleteProduct, togglePublished } from '../actions';

export default async function Productos({ searchParams }) {
  await guard('products');
  const products = await db.read('products');
  const cats = (await db.read('site')).categories;
  const q = (searchParams.q || '').toLowerCase();
  const list = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  return (
    <>
      <h1>Productos</h1>
      <p className="sub">{products.length} en total · {products.filter((p) => p.published).length} publicados</p>
      {searchParams.ok && <p className="ok">Producto guardado.</p>}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <Link className="btn btn-primary" href="/admin/productos/nuevo">+ Nuevo producto</Link>
        <form style={{ display: 'flex', gap: 8 }}>
          <input name="q" defaultValue={searchParams.q || ''} placeholder="Buscar por nombre"
            style={{ font: 'inherit', fontSize: 13.5, padding: '10px 12px', border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--text)' }} />
          <button className="btn btn-ghost">Buscar</button>
        </form>
      </div>

      <table className="tbl">
        <thead>
          <tr><th></th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td><img src={p.images[0]} alt="" /></td>
              <td>
                <Link href={'/admin/productos/' + p.id} style={{ fontWeight: 500 }}>{p.name}</Link>
                <div className="muted" style={{ fontSize: 11.5 }}>{p.brand} · {p.sku}</div>
              </td>
              <td>{cats.find((c) => c.id === p.category)?.name || p.category}</td>
              <td>{ARS(p.price)}{p.oldPrice ? <div className="muted" style={{ fontSize: 11.5, textDecoration: 'line-through' }}>{ARS(p.oldPrice)}</div> : null}</td>
              <td style={{ color: p.stock < 1 ? 'var(--accent)' : 'inherit' }}>{p.stock}</td>
              <td>
                <ActionForm action={togglePublished}>
                  <input type="hidden" name="id" value={p.id} />
                  <Submit variant="btn-ghost" style={{ padding: '6px 10px', fontSize: 11.5 }}>
                    {p.published ? 'Publicado' : 'Oculto'}
                  </Submit>
                </ActionForm>
              </td>
              <td>
                <ActionForm action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <Submit variant="btn-ghost" style={{ padding: '6px 10px', fontSize: 11.5 }}>Eliminar</Submit>
                </ActionForm>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && <p className="muted" style={{ padding: '30px 0' }}>Sin resultados.</p>}
    </>
  );
}
