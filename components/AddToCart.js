'use client';
import { useState } from 'react';
import { useCart } from './cart';

export default function AddToCart({ id, stock }) {
  const cart = useCart();
  const [q, setQ] = useState(1);
  const out = stock < 1;
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '22px 0 8px' }}>
      <div className="qty">
        <button onClick={() => setQ((v) => Math.max(1, v - 1))} aria-label="Menos">−</button>
        <span>{q}</span>
        <button onClick={() => setQ((v) => Math.min(20, stock || 20, v + 1))} aria-label="Más">+</button>
      </div>
      <button className="btn btn-primary" style={{ flex: 1, minWidth: 200, justifyContent: 'center' }}
        disabled={out} onClick={() => cart.add(id, q)}>
        {out ? 'Sin stock' : 'Agregar al carrito'}
      </button>
    </div>
  );
}
