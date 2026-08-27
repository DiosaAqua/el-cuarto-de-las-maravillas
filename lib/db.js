import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'data');
const ON_NETLIFY = !!process.env.NETLIFY;

/**
 * Store de datos: JSON por colección ('site', 'products', 'orders', 'users',
 * 'subscribers'). En local, cada colección es un archivo en data/*.json
 * (igual que siempre). En Netlify, cada colección es una key dentro de un
 * store de Netlify Blobs — no requiere cuenta ni configuración aparte, está
 * disponible solo con desplegar en Netlify.
 *
 * Si el catálogo crece mucho más, se cambia SÓLO este archivo por
 * SQLite/Postgres: el resto de la app usa read/write/update.
 */

function readLocal(name) {
  return JSON.parse(fs.readFileSync(path.join(DIR, name + '.json'), 'utf8'));
}

function writeLocal(name, data) {
  const target = path.join(DIR, name + '.json');
  try { fs.copyFileSync(target, target.replace(/\.json$/, '.bak.json')); } catch {}
  const tmp = target + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, target);
  return data;
}

let blobsStore = null;
async function dataStore() {
  if (!blobsStore) {
    const { getStore } = await import('@netlify/blobs');
    blobsStore = getStore('velure-data');
  }
  return blobsStore;
}

export async function read(name) {
  if (!ON_NETLIFY) return readLocal(name);
  const store = await dataStore();
  const data = await store.get(name, { type: 'json' });
  if (data === null) throw new Error('No hay datos para "' + name + '" en Netlify Blobs. Corré scripts/migrate-to-blobs.mjs.');
  return data;
}

export async function write(name, data) {
  if (!ON_NETLIFY) return writeLocal(name, data);
  const store = await dataStore();
  await store.setJSON(name, data);
  return data;
}

export async function update(name, mutate) {
  const data = await read(name);
  const out = mutate(data);
  return write(name, out === undefined ? data : out);
}

export function nextId(list, prefix) {
  const taken = new Set(list.map((x) => x.id));
  let n = 1;
  while (taken.has(prefix + n)) n += 1;
  return prefix + n;
}

const DIACRITICS = new RegExp(String.fromCharCode(91, 0x0300) + '-' + String.fromCharCode(0x036f, 93), 'g');
export const slugify = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
