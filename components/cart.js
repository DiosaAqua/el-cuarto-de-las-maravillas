'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ARS } from '@/lib/format';

const KEY = 'velure.cart.v1';
const FAV = 'velure.favs.v1';
const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };

export default function CartProvider({ site, children }) {
  const [lines, setLines] = useState([]);
  const [favs, setFavs] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [name, setName] = useState('');
  const [productsById, setProductsById] = useState({});
  const timer = useRef();
  const requested = useRef(new Set());

  useEffect(() => {
    setLines(load(KEY));
    setFavs(load(FAV));
  }, []);

  // El catálogo completo no viaja al cliente (son miles de productos): acá se piden
  // sólo los datos (precio, nombre, imagen) de lo que el usuario tiene en el carrito.
  useEffect(() => {
    const missing = [...new Set(lines.map((l) => l.id))].filter((id) => !requested.current.has(id));
    if (!missing.length) return;
    missing.forEach((id) => requested.current.add(id));
    fetch('/api/cart-products?ids=' + missing.join(','))
      .then((r) => r.json())
      .then(({ products }) => {
        setProductsById((prev) => {
          const next = { ...prev };
          for (const p of products) next[p.id] = p;
          return next;
        });
      })
      .catch(() => { missing.forEach((id) => requested.current.delete(id)); });
  }, [lines]);

  const persist = (next) => { setLines(next); localStorage.setItem(KEY, JSON.stringify(next)); };
  const flash = (msg) => { setToast(msg); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 2200); };

  const api = useMemo(() => {
    const find = (id) => productsById[id];
    const detailed = lines.map((l) => ({ ...l, p: find(l.id) })).filter((l) => l.p);
    const subtotal = detailed.reduce((s, l) => s + l.p.price * l.qty, 0);
    const freeFrom = site.checkout.freeShippingFrom;
    const ship = !detailed.length ? 0 : freeFrom && subtotal >= freeFrom ? 0 : site.checkout.shippingCost || 0;
    return {
      lines: detailed, count: detailed.reduce((s, l) => s + l.qty, 0), subtotal, ship, total: subtotal + ship,
      favs, open, setOpen, toast, name, setName, whatsapp: site.brand.whatsapp,
      add(id, qty = 1) {
        const cur = lines.find((l) => l.id === id);
        persist(cur ? lines.map((l) => (l.id === id ? { ...l, qty: Math.min(20, l.qty + qty) } : l)) : [...lines, { id, qty }]);
        flash('Agregado al carrito'); setOpen(true);
      },
      step(id, d) {
        const next = lines.map((l) => (l.id === id ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0 && l.qty <= 20);
        persist(next);
      },
      remove(id) { persist(lines.filter((l) => l.id !== id)); },
      toggleFav(id) {
        const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
        setFavs(next); localStorage.setItem(FAV, JSON.stringify(next));
      },
      async checkout() {
        const items = lines.map(({ id, qty }) => ({ id, qty }));
        try {
          await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, customer: { name } }) });
        } catch {}
        const body = [
          site.checkout.whatsappMessage,
          ...detailed.map((l) => '• ' + l.qty + '× ' + l.p.name + ' — ' + ARS(l.p.price * l.qty)),
          '',
          'Subtotal: ' + ARS(subtotal),
          ship ? 'Envío: ' + ARS(ship) : 'Envío: gratis',
          'Total: ' + ARS(subtotal + ship),
          name ? 'Nombre: ' + name : '',
        ].filter(Boolean).join('\n');
        window.open('https://wa.me/' + site.brand.whatsapp + '?text=' + encodeURIComponent(body), '_blank');
      },
    };
  }, [lines, favs, open, toast, name, productsById, site]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className={'drawer-bd' + (open ? ' on' : '')} onClick={() => setOpen(false)} />
      <aside className={'drawer' + (open ? ' on' : '')} aria-label="Carrito">
        <header>
          <strong style={{ fontSize: 15 }}>Tu carrito ({api.count})</strong>
          <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
        </header>
        <div className="lines">
          {!api.lines.length && <p className="muted" style={{ padding: '32px 0' }}>Todavía no agregaste nada.</p>}
          {api.lines.map((l) => (
            <div className="line" key={l.id}>
              <img src={l.p.images[0]} alt="" />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{l.p.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{ARS(l.p.price)}</div>
                <div className="qty" style={{ marginTop: 8, scale: '.85', transformOrigin: 'left' }}>
                  <button onClick={() => api.step(l.id, -1)} aria-label="Menos">−</button>
                  <span>{l.qty}</span>
                  <button onClick={() => api.step(l.id, 1)} aria-label="Más">+</button>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => api.remove(l.id)} aria-label="Quitar">×</button>
            </div>
          ))}
        </div>
        <footer>
          <div className="row"><span className="muted">Subtotal</span><span>{ARS(api.subtotal)}</span></div>
          <div className="row"><span className="muted">Envío</span><span>{api.lines.length ? (api.ship ? ARS(api.ship) : 'Gratis') : '—'}</span></div>
          <div className="row" style={{ fontSize: 16, fontWeight: 600 }}><span>Total</span><span>{ARS(api.total)}</span></div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre (opcional)"
            style={{ font: 'inherit', fontSize: 13, padding: '10px 12px', border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--text)' }} />
          <button className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={!api.lines.length} onClick={api.checkout}>
            Finalizar por WhatsApp
          </button>
          <span className="muted" style={{ fontSize: 11.5 }}>Te llevamos a WhatsApp con el pedido ya armado.</span>
        </footer>
      </aside>
      <div className={'toast' + (toast ? ' on' : '')}>{toast}</div>
    </Ctx.Provider>
  );
}
