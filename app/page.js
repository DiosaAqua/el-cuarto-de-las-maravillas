import Link from 'next/link';
import { getSite, getProducts } from '@/lib/shop';
import { off } from '@/lib/format';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import Newsletter from '@/components/Newsletter';

export default async function Home() {
  const site = await getSite();
  const all = await getProducts();
  const s = site.sections;
  const nuevos = [...all].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 8);
  const promo = all.filter((p) => p.oldPrice).slice(0, 3);
  const dest = all.filter((p) => p.featured).slice(0, 3);
  return (
    <>
      <Hero slides={site.hero} />

      {s.showCategories && (
        <section className="blk wrap" id="categorias">
          <div className="sechead">
            <h2>{s.categoriesTitle}</h2>
            <Link href="/catalogo" style={{ fontSize: 12.5 }}>{s.categoriesLink} →</Link>
          </div>
          <div className="catgrid">
            {site.categories.filter((c) => c.showOnHome).map((c) => (
              <Link key={c.id} href={'/catalogo?cat=' + c.id} className="cattile">
                <img src={c.image} alt={c.name} />
                <div className="shade" /><span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {s.showNew && (
        <section className="blk wrap" style={{ paddingTop: 0 }}>
          <div className="sechead">
            <div>
              <h2>{s.newTitle}</h2>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>{s.newSubtitle}</p>
            </div>
            <Link href="/catalogo?orden=nuevo" style={{ fontSize: 12.5 }}>Ver más →</Link>
          </div>
          <div className="pgrid">{nuevos.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
      )}

      {s.showPromo && !!promo.length && (
        <section className="promo wrap">
          <div>
            <div className="kicker" style={{ color: 'color-mix(in srgb,var(--accent) 60%,var(--on-dark))', marginBottom: 14 }}>{site.promo.kicker}</div>
            <h2>{site.promo.title1}<br />{site.promo.title2}</h2>
            <p>{site.promo.copy}</p>
            <Link href={site.promo.href} className="btn btn-light">{site.promo.cta}</Link>
          </div>
          <div className="picks">
            {promo.map((p) => (
              <Link key={p.id} href={'/producto/' + p.slug}>
                <img src={p.images[0]} alt={p.name} /><span>-{off(p)}%</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {s.showFeatured && !!dest.length && (
        <section className="blk wrap">
          <h2 style={{ fontSize: 'clamp(24px,3vw,32px)' }}>{s.featuredTitle}</h2>
          <p className="muted" style={{ margin: '8px 0 30px', fontSize: 13.5 }}>{s.featuredSubtitle}</p>
          <div className="pgrid">{dest.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
      )}

      {s.showTrust && (
        <section className="trust wrap">
          {site.trust.map((t, i) => (
            <div key={i}><div className="ico">{t.icon}</div><b>{t.title}</b></div>
          ))}
        </section>
      )}

      {s.showNewsletter && <Newsletter config={site.newsletter} />}
    </>
  );
}
