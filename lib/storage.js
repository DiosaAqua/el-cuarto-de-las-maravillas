import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
// process.env.NETLIFY sólo existe durante el build; en la función ya desplegada
// (donde importa esto) el runtime de Netlify inyecta NETLIFY_BLOBS_CONTEXT.
const ON_NETLIFY = !!(process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY);

const EXT_TYPE = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif' };
const extOf = (name) => (name.split('.').pop() || '').toLowerCase();
const typeOf = (name) => EXT_TYPE[extOf(name)] || 'application/octet-stream';

let blobsStore = null;
async function uploadsStore() {
  if (!blobsStore) {
    const { getStore } = await import('@netlify/blobs');
    const opts = process.env.NETLIFY_SITE_ID ? { siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_AUTH_TOKEN } : {};
    blobsStore = getStore({ name: 'velure-uploads', ...opts });
  }
  return blobsStore;
}

/** Guarda una imagen. `buffer` es un Buffer/ArrayBuffer con el contenido. */
export async function putImage(filename, buffer) {
  if (!ON_NETLIFY) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(buffer));
    return '/uploads/' + filename;
  }
  const store = await uploadsStore();
  await store.set(filename, buffer, { metadata: { contentType: typeOf(filename), uploadedAt: Date.now() } });
  return '/uploads/' + filename;
}

/** Lee una imagen para servirla. Devuelve { buffer, contentType } o null. */
export async function getImage(filename) {
  if (!ON_NETLIFY) {
    const target = path.join(UPLOADS_DIR, filename);
    try {
      const buffer = fs.readFileSync(target);
      return { buffer, contentType: typeOf(filename) };
    } catch { return null; }
  }
  const store = await uploadsStore();
  const entry = await store.getWithMetadata(filename, { type: 'arrayBuffer' });
  if (!entry) return null;
  return { buffer: Buffer.from(entry.data), contentType: entry.metadata?.contentType || typeOf(filename) };
}

/** Lista imágenes subidas, más nuevas primero: [{ name, url }]. */
export async function listImages() {
  if (!ON_NETLIFY) {
    try {
      return fs.readdirSync(UPLOADS_DIR)
        .filter((n) => /\.(jpe?g|png|webp|avif|gif)$/i.test(n))
        .map((n) => ({ n, t: fs.statSync(path.join(UPLOADS_DIR, n)).mtimeMs }))
        .sort((a, b) => b.t - a.t)
        .map((x) => ({ name: x.n, url: '/uploads/' + x.n }));
    } catch { return []; }
  }
  const store = await uploadsStore();
  const { blobs } = await store.list();
  const withMeta = await Promise.all(blobs.map(async (b) => {
    const meta = await store.getMetadata(b.key);
    return { name: b.key, url: '/uploads/' + b.key, t: meta?.metadata?.uploadedAt || 0 };
  }));
  return withMeta.sort((a, b) => b.t - a.t).map(({ name, url }) => ({ name, url }));
}

export async function deleteImage(filename) {
  if (!ON_NETLIFY) {
    try { fs.unlinkSync(path.join(UPLOADS_DIR, filename)); return true; } catch { return false; }
  }
  const store = await uploadsStore();
  await store.delete(filename);
  return true;
}
