'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './cart';

export default function Header({ site }) {
  const cart = useCart();
  const [menu, setMenu] = useState(false);
  const nav = site.categories.slice(0, 7);
  return (
    <>
      {site.topbar.enabled && (
        <div className="topbar">
          {site.topbar.items.map((t, i) => (
            <span key={i} style={{ display: 'flex', gap: 14 }}>
              {i > 0 && <span style={{ opacity: .4 }}>·</span>}{t}
            </span>
          ))}
        </div>
      )}
      <header className="site">
        <div className="headrow wrap">
          <Link href="/" className="brandmark" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {site.brand.logoImage && <img src={site.brand.logoImage} alt="" />}
            <span>{site.brand.logoText}</span>
          </Link>
          <nav className="mainnav">
            {nav.map((c) => <Link key={c.id} href={'/catalogo?cat=' + c.id}>{c.name}</Link>)}
          </nav>
          <div style={{ flex: 1 }} />
          <form className="search" action="/catalogo">
            <span aria-hidden style={{ fontSize: 13, opacity: .6 }}>⚲</span>
            <input name="q" placeholder="Buscar productos" aria-label="Buscar productos" />
          </form>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-primary btn-icon" style={{ position: 'relative' }} onClick={() => cart.setOpen(true)} aria-label="Carrito">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {!!cart?.count && <span className="badge-count" style={{ background: 'var(--on-dark)', color: 'var(--accent-dark)' }}>{cart.count}</span>}
            </button>
            <button className="btn btn-ghost btn-icon burger" onClick={() => setMenu((v) => !v)} aria-label="Menú">☰</button>
          </div>
        </div>
        {menu && (
          <nav className="wrap" style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--divider)', paddingBottom: 14 }}>
            {nav.map((c) => (
              <Link key={c.id} href={'/catalogo?cat=' + c.id} onClick={() => setMenu(false)}
                style={{ fontSize: 13.5, padding: '9px 0', color: 'var(--text)', borderBottom: '1px solid var(--divider)' }}>{c.name}</Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
