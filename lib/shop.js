import 'server-only';
import * as db from './db';
import { listImages } from './storage';

export const getSite = () => db.read('site');
export const getProducts = async () => (await db.read('products')).filter((p) => p.published);
export const getProduct = async (slug) =>
  (await db.read('products')).find((p) => (p.slug === slug || p.id === slug) && p.published) || null;

export async function filterProducts(sp = {}) {
  let items = await getProducts();
  const { cat, marca, q, oferta, orden, max } = sp;
  if (cat) items = items.filter((p) => p.category === cat);
  if (marca) items = items.filter((p) => p.brand === marca);
  if (oferta) items = items.filter((p) => p.oldPrice);
  if (max) items = items.filter((p) => p.price <= Number(max));
  if (q) {
    const n = String(q).toLowerCase();
    items = items.filter((p) => (p.name + ' ' + p.brand + ' ' + (p.shortDescription || '')).toLowerCase().includes(n));
  }
  const sorters = {
    'precio-asc': (a, b) => a.price - b.price,
    'precio-desc': (a, b) => b.price - a.price,
    nuevo: (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
  };
  if (sorters[orden]) items = [...items].sort(sorters[orden]);
  return items;
}

/** Rutas de todas las imágenes subidas, más nuevas primero. */
export async function listUploads() {
  const items = await listImages();
  return items.map((x) => x.url);
}
