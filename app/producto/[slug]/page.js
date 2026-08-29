import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getSite, getProducts } from '@/lib/shop';
import { ARS, off, cuota } from '@/lib/format';
import Gallery from '@/components/Gallery';
import AddToCart from '@/components/AddToCart';
import ProductCard from '@/components/ProductCard';

export async function generateMetadata({ params }) {
  const p = await getProduct(params.slug);
  return p ? { title: p.name, description: p.shortDescription } : {};
}

export default async function Producto({ params }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();
  const site = await getSite();
  const cat = site.categories.find((c) => c.id === p.category);
  const related = (await getProducts())
    .filter((x) => x.category === p.category && x.id !== p.id)
    .sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0))
    .slice(0, 4);
  const d = off(p);
  return (
    <>
      <section className="blk wrap" style={{ paddingBottom: 'clamp(32px,4vw,52px)' }}>
        <nav className="muted" style={{ fontSize: 12, marginBottom: 22 }}>
          <Link href="/">Inicio</Link> / <Link href={'/catalogo?cat=' + p.category}>{cat?.name}</Link> / {p.name}
        </nav>
        <div className="pdp">
          <Gallery images={p.images} alt={p.name} />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div className="brand" style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{p.brand}</div>
              {p.sku && <span className="tag" style={{ fontSize: 11 }}>Código: {p.sku}</span>}
            </div>
            <h1>{p.name}</h1>
            <p className="muted" style={{ fontSize: 14.5, margin: 0 }}>{p.shortDescription}</p>
            <div className="bigprice">
              <b>{ARS(p.price)}</b>
              {p.oldPrice && <s>{ARS(p.oldPrice)}</s>}
              {!!d && <span className="tag tag-accent">-{d}%</span>}
            </div>
            {cuota(p) && <div style={{ color: 'var(--accent-dark)', fontSize: 13.5 }}>{p.installments} cuotas sin interés de {cuota(p)}</div>}
            <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
              {p.freeShipping ? 'Envío gratis · ' : ''}{p.stock > 0 ? p.stock + ' en stock' : 'Sin stock'}
            </div>
            <AddToCart id={p.id} stock={p.stock} />
            <a className="btn btn-ghost btn-block" style={{ width: '100%', justifyContent: 'center' }}
              href={'https://wa.me/' + site.brand.whatsapp + '?text=' + encodeURIComponent(
                p.stock > 0
                  ? 'Hola! Quiero hacer un pedido: ' + p.name + ' (' + p.sku + ') - ' + ARS(p.price)
                  : 'Hola! Quiero consultar un producto ' + p.name + ' (' + p.sku + ')'
              )}
              target="_blank" rel="noreferrer">{p.stock > 0 ? 'Pedir por WhatsApp' : 'Consultar por WhatsApp'}</a>

            <div style={{ marginTop: 28 }}>
              <details className="acc" open>
                <summary>Descripción</summary>
                <div className="body" dangerouslySetInnerHTML={{ __html: p.description }} />
              </details>
              {!!p.specs?.length && (
                <details className="acc">
                  <summary>Especificaciones</summary>
                  <div className="body">
                    <table className="spectable">
                      <tbody>{p.specs.map((s, i) => <tr key={i}><td>{s.k}</td><td>{s.v}</td></tr>)}</tbody>
                    </table>
                  </div>
                </details>
              )}
              <details className="acc">
                <summary>Envíos y privacidad</summary>
                <div className="body">Empaque neutro, sin marcas ni referencias al contenido. Envíos a todo el país.</div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {!!related.length && (
        <section className="blk wrap" style={{ paddingTop: 0 }}>
          <div className="sechead"><h2 style={{ fontSize: 22 }}>También te puede gustar</h2></div>
          <div className="pgrid">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </section>
      )}
    </>
  );
}
