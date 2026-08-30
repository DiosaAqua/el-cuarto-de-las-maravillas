import Link from 'next/link';
import { guard } from '../guard';
import * as db from '@/lib/db';
import { ARS } from '@/lib/format';
import { deleteProduct, togglePublished } from '../actions';

const PAGE_SIZE = 60;

/** Ojo con esta página: con miles de productos, armar una fila por cada uno
 *  con formularios interactivos (uno de esos componentes por botón) satura
 *  la función de Netlify y tira el sitio abajo — nos pasó en producción.
 *  Por eso: paginado, y los botones de fila son <form> comunes sin
 *  componente cliente (el server action redirige de vuelta a la lista). */
export default async function Productos({ searchParams }) {
  await guard('products');
  const products = await db.read('products');
  const cats = (await db.read('site')).categories;
  const q = (searchParams.q || '').toLowerCase();
  const page = Math.max(1, parseInt(searchParams.page, 10) || 1);
  const list = q ? products.filter((p) => p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)) : products;
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageQS = (p) => {
    const qs = new URLSearchParams();
    if (q) qs.set('q', searchParams.q);
    if (p !== 1) qs.set('page', String(p));
    const s = qs.toString();
    return '/admin/productos' + (s ? '?' + s : '');
  };

  return (
    <>
      <h1>Productos</h1>
      <p className="sub">{products.length} en total · {products.filter((p) => p.published).length} publicados{q ? ` · ${list.length} resultado(s) para "${searchParams.q}"` : ''}</p>
      {searchParams.ok && <p className="ok">Producto guardado.</p>}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <Link className="btn btn-primary" href="/admin/productos/nuevo">+ Nuevo producto</Link>
        <form style={{ display: 'flex', gap: 8 }}>
          <input name="q" defaultValue={searchParams.q || ''} placeholder="Buscar por nombre o código"
            style={{ font: 'inherit', fontSize: 13.5, padding: '10px 12px', border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--text)' }} />
          <button className="btn btn-ghost">Buscar</button>
        </form>
      </div>

      <table className="tbl">
        <thead>
          <tr><th></th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          {pageItems.map((p) => (
            <tr key={p.id}>
              <td><img src={p.images[0]} alt="" loading="lazy" decoding="async" /></td>
              <td>
                <Link href={'/admin/productos/' + p.id} style={{ fontWeight: 500 }}>{p.name}</Link>
                <div className="muted" style={{ fontSize: 11.5 }}>{p.brand} · {p.sku}</div>
              </td>
              <td>{cats.find((c) => c.id === p.category)?.name || p.category}</td>
              <td>{ARS(p.price)}{p.oldPrice ? <div className="muted" style={{ fontSize: 11.5, textDecoration: 'line-through' }}>{ARS(p.oldPrice)}</div> : null}</td>
              <td style={{ color: p.stock < 1 ? 'var(--accent)' : 'inherit' }}>{p.stock}</td>
              <td>
                <form action={togglePublished}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="q" value={searchParams.q || ''} />
                  <input type="hidden" name="page" value={safePage} />
                  <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 11.5 }}>{p.published ? 'Publicado' : 'Oculto'}</button>
                </form>
              </td>
              <td>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="q" value={searchParams.q || ''} />
                  <input type="hidden" name="page" value={safePage} />
                  <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 11.5 }}>Eliminar</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && <p className="muted" style={{ padding: '30px 0' }}>Sin resultados.</p>}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          <Link className="btn btn-ghost" aria-disabled={safePage <= 1} href={pageQS(Math.max(1, safePage - 1))}
            style={safePage <= 1 ? { pointerEvents: 'none', opacity: .4 } : undefined}>← Anterior</Link>
          <span className="muted" style={{ fontSize: 13 }}>Página {safePage} de {totalPages}</span>
          <Link className="btn btn-ghost" aria-disabled={safePage >= totalPages} href={pageQS(Math.min(totalPages, safePage + 1))}
            style={safePage >= totalPages ? { pointerEvents: 'none', opacity: .4 } : undefined}>Siguiente →</Link>
        </div>
      )}
    </>
  );
}
