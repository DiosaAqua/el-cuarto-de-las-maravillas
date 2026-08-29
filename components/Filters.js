'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { ARS } from '@/lib/format';

/** Filtros del catálogo: categoría y marca de selección múltiple + rango de precio. */
export default function Filters({ cats, brands, searchParams, maxPrice }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = searchParams || {};
  const selCats = String(sp.cat || '').split(',').filter(Boolean);
  const selBrands = String(sp.marca || '').split(',').filter(Boolean);
  const [priceLabel, setPriceLabel] = useState(sp.max ? Number(sp.max) : maxPrice);

  const go = (patch) => {
    const merged = { ...sp, ...patch };
    const u = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => { if (v) u.set(k, String(v)); });
    router.push(pathname + (u.toString() ? '?' + u : ''));
  };

  const toggle = (key, list, value) => {
    const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
    go({ [key]: next.join(',') });
  };

  const commitPrice = (e) => {
    const v = Number(e.target.value);
    go({ max: v >= maxPrice ? '' : v });
  };

  const hasFilters = selCats.length || selBrands.length || sp.oferta || sp.max;

  return (
    <aside className="filters">
      {!!hasFilters && (
        <button type="button" className="clearfilters" onClick={() => router.push(pathname + (sp.q ? '?q=' + encodeURIComponent(sp.q) : ''))}>
          Limpiar filtros
        </button>
      )}
      <fieldset>
        <legend>Categoría</legend>
        {cats.map((c) => (
          <label key={c.id}>
            <input type="checkbox" checked={selCats.includes(c.id)} onChange={() => toggle('cat', selCats, c.id)} />
            {c.name}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Marca</legend>
        {brands.map((b) => (
          <label key={b}>
            <input type="checkbox" checked={selBrands.includes(b)} onChange={() => toggle('marca', selBrands, b)} />
            {b}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Precio</legend>
        <input
          type="range"
          className="pricerange"
          min={0}
          max={maxPrice}
          step={Math.max(1, Math.round(maxPrice / 100))}
          defaultValue={sp.max ? Number(sp.max) : maxPrice}
          onChange={(e) => setPriceLabel(Number(e.target.value))}
          onMouseUp={commitPrice}
          onTouchEnd={commitPrice}
          onKeyUp={commitPrice}
          style={{ '--fill': Math.min(100, (priceLabel / (maxPrice || 1)) * 100) + '%' }}
        />
        <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>Hasta {ARS(priceLabel)}</div>
      </fieldset>

      <fieldset>
        <legend>Ofertas</legend>
        <label>
          <input type="checkbox" checked={!!sp.oferta} onChange={() => go({ oferta: sp.oferta ? '' : '1' })} />
          Sólo con descuento
        </label>
      </fieldset>
    </aside>
  );
}
