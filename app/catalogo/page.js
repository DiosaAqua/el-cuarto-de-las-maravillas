import Link from 'next/link';
import { getSite, filterProducts } from '@/lib/shop';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';

export const metadata = { title: 'Catálogo' };

export default async function Catalogo({ searchParams }) {
  const site = await getSite();
  const sp = searchParams || {};
  const items = await filterProducts(sp);
  const cats = site.categories || [];
  const cat = cats.find((c) => c.id === sp.cat);
  const qs = (patch) => {
    const u = new URLSearchParams(Object.entries(sp).filter(([, v]) => v));
    Object.entries(patch).forEach(([k, v]) => (v ? u.set(k, v) : u.delete(k)));
    return '/catalogo' + (u.toString() ? '?' + u : '');
  };
  return (
    <section className="blk wrap">
      <nav className="muted" style={{ fontSize: 12, marginBottom: 18 }}>
        <Link href="/">Inicio</Link> / {cat ? cat.name : 'Catálogo'}
      </nav>
      <div className="sechead">
        <div>
          <h2>{cat ? cat.name : sp.q ? 'Resultados para “' + sp.q + '”' : 'Todo el catálogo'}</h2>
          <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>{items.length} producto{items.length === 1 ? '' : 's'}</p>
        </div>
        <SortSelect searchParams={sp} />
      </div>

      <div className="layout">
        <aside className="filters">
          <fieldset>
            <legend>Categorías</legend>
            <Link href={qs({ cat: '' })} className={'chip' + (!sp.cat ? ' on' : '')}>Todas</Link>
            {cats.map((c) => (
              <Link key={c.id} href={qs({ cat: c.id })} className={'chip' + (sp.cat === c.id ? ' on' : '')}>{c.name}</Link>
            ))}
          </fieldset>
          <fieldset>
            <legend>Marca</legend>
            <Link href={qs({ marca: '' })} className={'chip' + (!sp.marca ? ' on' : '')}>Todas</Link>
            {(site.brands || []).map((b) => (
              <Link key={b} href={qs({ marca: b })} className={'chip' + (sp.marca === b ? ' on' : '')}>{b}</Link>
            ))}
          </fieldset>
          <fieldset>
            <legend>Ofertas</legend>
            <Link href={qs({ oferta: sp.oferta ? '' : '1' })} className={'chip' + (sp.oferta ? ' on' : '')}>
              Sólo con descuento
            </Link>
          </fieldset>
        </aside>

        <div>
          {items.length ? (
            <div className="pgrid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          ) : (
            <p className="muted" style={{ padding: '40px 0' }}>No encontramos productos con esos filtros. <Link href="/catalogo">Ver todo</Link></p>
          )}
        </div>
      </div>
    </section>
  );
}
