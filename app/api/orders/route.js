import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req) {
  const { items = [], customer = {} } = await req.json().catch(() => ({}));
  if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
  const catalog = await db.read('products');
  const lines = items.map((i) => {
    const p = catalog.find((x) => x.id === i.id && x.published);
    return p ? { id: p.id, name: p.name, price: p.price, qty: Math.max(1, Math.min(20, Number(i.qty) || 1)) } : null;
  }).filter(Boolean);
  if (!lines.length) return NextResponse.json({ error: 'Productos inválidos' }, { status: 400 });
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const order = {
    id: 'o' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    status: 'nuevo',
    customer: { name: String(customer.name || '').slice(0, 120), phone: String(customer.phone || '').slice(0, 40) },
    lines, subtotal,
  };
  await db.update('orders', (list) => { list.unshift(order); });
  return NextResponse.json({ id: order.id, subtotal }, { status: 201 });
}
