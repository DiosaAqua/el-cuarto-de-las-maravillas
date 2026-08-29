import Link from 'next/link';
import { getSite, filterProducts, getProducts } from '@/lib/shop';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';
import Filters from '@/components/Filters';

export const metadata = { title: 'Catálogo' };

export default async function Catalogo({ searchParams }) {
  const site = await getSite();
  const sp = searchParams || {};
  const items = await filterProducts(sp);
  const all = await getProducts();
  const cats = site.categories || [];
  const selCats = String(sp.cat || '').split(',').filter(Boolean);
  const title = selCats.length === 1 ? cats.find((c) => c.id === selCats[0])?.name : null;
  // El slider usa un techo por percentil (no el máximo real): un puñado de productos
  // extremos (p.ej. muñecas de gama alta) no deben aplastar la escala para el resto.
  // Igual quedan visibles: al final del todo el slider (v >= maxPrice) no aplica límite.
  const sortedPrices = all.map((p) => p.price).sort((a, b) => a - b);
  const p99 = sortedPrices[Math.floor(sortedPrices.length * 0.99)] || 0;
  const maxPrice = Math.max(1000, Math.ceil(p99 / 10000) * 10000);
  return (
    <section className="blk wrap">
      <nav className="muted" style={{ fontSize: 12, marginBottom: 18 }}>
        <Link href="/">Inicio</Link> / {title || 'Catálogo'}
      </nav>
      <div className="sechead">
        <div>
          <h2>{title || (sp.q ? 'Resultados para “' + sp.q + '”' : 'Todo el catálogo')}</h2>
          <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>{items.length} producto{items.length === 1 ? '' : 's'}</p>
        </div>
        <SortSelect searchParams={sp} />
      </div>

      <div className="layout">
        <Filters cats={cats} brands={site.brands || []} searchParams={sp} maxPrice={maxPrice} />

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
