import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shop';

/**
 * Devuelve sólo los datos mínimos (para el carrito/drawer) de los productos
 * pedidos por id. El catálogo completo (miles de productos) ya no viaja
 * entero al cliente en cada página — el carrito pide acá nada más que lo
 * que el usuario tiene en sus líneas.
 */
export async function GET(req) {
  const idsParam = new URL(req.url).searchParams.get('ids') || '';
  const ids = new Set(idsParam.split(',').map((s) => s.trim()).filter(Boolean));
  if (!ids.size) return NextResponse.json({ products: [] });

  const all = await getProducts();
  const products = all
    .filter((p) => ids.has(p.id))
    .map((p) => ({ id: p.id, slug: p.slug, name: p.name, price: p.price, oldPrice: p.oldPrice, images: p.images.slice(0, 1), stock: p.stock }));

  return NextResponse.json({ products });
}
