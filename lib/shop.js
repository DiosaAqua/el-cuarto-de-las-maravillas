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
  const cats = String(cat || '').split(',').filter(Boolean);
  const marcas = String(marca || '').split(',').filter(Boolean);
  if (cats.length) items = items.filter((p) => cats.includes(p.category));
  if (marcas.length) items = items.filter((p) => marcas.includes(p.brand));
  if (oferta) items = items.filter((p) => p.oldPrice);
  if (max) items = items.filter((p) => p.price <= Number(max));
  if (q) {
    const n = String(q).toLowerCase();
    items = items.filter((p) => (p.name + ' ' + p.brand + ' ' + p.sku + ' ' + (p.shortDescription || '')).toLowerCase().includes(n));
  }
  const sorters = {
    'precio-asc': (a, b) => a.price - b.price,
    'precio-desc': (a, b) => b.price - a.price,
    nuevo: (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
  };
  const secondary = sorters[orden];
  // Con stock primero, siempre; el orden elegido (o el orden natural) decide adentro de cada grupo.
  items = [...items].sort((a, b) => {
    const stockDiff = (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0);
    if (stockDiff) return stockDiff;
    return secondary ? secondary(a, b) : 0;
  });
  return items;
}

/** Rutas de todas las imágenes subidas, más nuevas primero. */
export async function listUploads() {
  const items = await listImages();
  return items.map((x) => x.url);
}
