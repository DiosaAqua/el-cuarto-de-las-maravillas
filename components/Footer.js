import Link from 'next/link';

export default function Footer({ site }) {
  const { brand, footer, categories } = site;
  return (
    <footer className="site wrap">
      <div className="footcols">
        <div>
          <div className="brandmark" style={{ fontSize: 22, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            {brand.logoImage && <img src={brand.logoImage} alt="" style={{ height: 40 }} />}
            <span>{brand.logoText}</span>
          </div>
          <p className="muted" style={{ fontSize: 12.5, maxWidth: 220, margin: 0 }}>{brand.tagline}</p>
        </div>
        <div>
          <h6>Categorías</h6>
          <div className="col">
            {categories.slice(0, 6).map((c) => <Link key={c.id} href={'/catalogo?cat=' + c.id}>{c.name}</Link>)}
          </div>
        </div>
        <div>
          <h6>Empresa</h6>
          <div className="col">{footer.company.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</div>
        </div>
        <div>
          <h6>Legal</h6>
          <div className="col">{footer.legal.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</div>
        </div>
        <div>
          <h6>Contacto</h6>
          <div className="col">
            {brand.email && <a href={'mailto:' + brand.email}>{brand.email}</a>}
            <a href={'https://wa.me/' + brand.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
            {brand.instagram && <a href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a>}
            <span className="muted" style={{ fontSize: 12.5 }}>{brand.address}</span>
          </div>
        </div>
      </div>
      <hr className="hr" />
      <div className="footbot">
        <span className="muted" data-secret-admin style={{ fontSize: 11.5, userSelect: 'none' }}>
          {footer.copyright}
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {footer.payments.map((p) => <span className="tag" key={p}>{p}</span>)}
        </div>
      </div>
    </footer>
  );
}
