/**
 * Copia el contenido actual de data/*.json y public/uploads/ al sitio real de
 * Netlify (Netlify Blobs). Correr UNA vez, después del primer deploy.
 *
 * Necesita dos variables de entorno (las sacás del dashboard de Netlify:
 * Site settings → General → Site details, y User settings → Applications →
 * Personal access tokens):
 *
 *   NETLIFY_SITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *   NETLIFY_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *
 * Uso:
 *   NETLIFY_SITE_ID=... NETLIFY_AUTH_TOKEN=... node scripts/migrate-to-blobs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { getStore } from '@netlify/blobs';

const { NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN } = process.env;
if (!NETLIFY_SITE_ID || !NETLIFY_AUTH_TOKEN) {
  console.error('Faltan NETLIFY_SITE_ID y/o NETLIFY_AUTH_TOKEN. Mirá el comentario arriba de este archivo.');
  process.exit(1);
}

const opts = { siteID: NETLIFY_SITE_ID, token: NETLIFY_AUTH_TOKEN };
const COLLECTIONS = ['site', 'products', 'orders', 'users', 'subscribers'];
const EXT_TYPE = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif' };

async function migrateData() {
  const store = getStore({ name: 'velure-data', ...opts });
  for (const name of COLLECTIONS) {
    const file = path.join(process.cwd(), 'data', name + '.json');
    if (!fs.existsSync(file)) { console.log('— sin', name + '.json, salteado'); continue; }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    await store.setJSON(name, data);
    console.log('✔ datos:', name, Array.isArray(data) ? '(' + data.length + ' items)' : '');
  }
}

async function migrateUploads() {
  const dir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(dir)) { console.log('— no hay public/uploads'); return; }
  const store = getStore({ name: 'velure-uploads', ...opts });
  const files = fs.readdirSync(dir).filter((n) => /\.(jpe?g|png|webp|avif|gif)$/i.test(n));
  for (const name of files) {
    const buf = fs.readFileSync(path.join(dir, name));
    const ext = (name.split('.').pop() || '').toLowerCase();
    await store.set(name, buf, { metadata: { contentType: EXT_TYPE[ext] || 'application/octet-stream', uploadedAt: fs.statSync(path.join(dir, name)).mtimeMs } });
    console.log('✔ imagen:', name);
  }
  console.log(files.length, 'imagen(es) migradas.');
}

await migrateData();
await migrateUploads();
console.log('\nListo. El sitio en Netlify ya tiene el catálogo y las imágenes actuales.');
