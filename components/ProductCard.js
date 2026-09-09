'use client';
import Link from 'next/link';
import { ARS, off, cuota } from '@/lib/format';
import { useCart } from './cart';

export default function ProductCard({ p }) {
  const cart = useCart();
  const d = off(p);
  const fav = cart?.favs.includes(p.id);
  return (
    <article className="card">
      <Link href={'/producto/' + p.slug} className="shot">
        <img src={p.images[0]} alt={p.name} />
        {p.images[1] && <img className="alt" src={p.images[1]} alt="" />}
        {p.badge && <span className="tag tag-accent badge">{p.badge}</span>}
        {!!d && <span className="off">-{d}%</span>}
        <button className={'fav' + (fav ? ' on' : '')} aria-label="Favorito"
          onClick={(e) => { e.preventDefault(); cart.toggleFav(p.id); }}>{fav ? '♥' : '♡'}</button>
      </Link>
      <div className="brand">{p.brand}</div>
      <Link href={'/producto/' + p.slug} className="name" style={{ color: 'var(--text)' }}>{p.name}</Link>
      <div className="price"><b>{ARS(p.price)}</b>{p.oldPrice && <s>{ARS(p.oldPrice)}</s>}</div>
      {cuota(p) && <div className="cuotas">{p.installments}× de {cuota(p)} sin interés</div>}
      {p.freeShipping && <div className="cuotas" style={{ color: 'var(--muted)' }}>Envío gratis</div>}
      {p.stock < 1 ? (
        <a className="btn btn-ghost add" style={{ justifyContent: 'center' }}
          href={'https://wa.me/' + cart?.whatsapp + '?text=' + encodeURIComponent('Hola! Quiero consultar un producto ' + p.name + ' (' + p.sku + ')')}
          target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          Consultar stock
        </a>
      ) : (
        <button className="btn btn-ghost add" style={{ justifyContent: 'center' }} onClick={() => cart.add(p.id)}>
          Agregar al carrito
        </button>
      )}
    </article>
  );
}
