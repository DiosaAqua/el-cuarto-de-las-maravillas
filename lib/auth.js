import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import * as db from './db';

const COOKIE = 'velure_session';
const MAX_AGE = 60 * 60 * 12; // 12 h

/**
 * Permisos por rol.
 *  admin  → todo, incluido apariencia, tipografías, ajustes y usuarios
 *  editor → catálogo, contenido, imágenes y pedidos
 */
export const PERMISSIONS = {
  admin: ['products', 'content', 'media', 'appearance', 'settings', 'orders', 'users'],
  editor: ['products', 'content', 'media', 'orders'],
};

export const can = (user, perm) => !!user && (PERMISSIONS[user.role] || []).includes(perm);

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 24) throw new Error('Falta SESSION_SECRET (mínimo 24 caracteres) en las variables de entorno.');
  return s;
}

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

function serialize(data) {
  const payload = b64(JSON.stringify(data));
  return payload + '.' + sign(payload);
}

function deserialize(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() / 1000 ? data : null;
  } catch { return null; }
}

export async function getUser() {
  const token = cookies().get(COOKIE)?.value;
  const session = deserialize(token);
  if (!session) return null;
  const user = (await db.read('users')).find((u) => u.id === session.uid && u.active);
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

/** Para páginas y server actions: corta si no hay permiso. */
export async function requirePermission(perm) {
  const user = await getUser();
  if (!user) { const e = new Error('NO_SESSION'); e.code = 'NO_SESSION'; throw e; }
  if (!can(user, perm)) { const e = new Error('FORBIDDEN'); e.code = 'FORBIDDEN'; throw e; }
  return user;
}

export async function login(email, password) {
  const user = (await db.read('users')).find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase().trim() && u.active
  );
  // comparación siempre ejecutada para no filtrar si el email existe
  const hash = user?.passwordHash || '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
  const ok = await bcrypt.compare(String(password || ''), hash);
  if (!ok || !user) return null;
  cookies().set(COOKIE, serialize({ uid: user.id, exp: Math.floor(Date.now() / 1000) + MAX_AGE }), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: MAX_AGE,
  });
  await db.update('users', (list) => {
    const u = list.find((x) => x.id === user.id);
    if (u) u.lastLogin = new Date().toISOString();
  });
  return user;
}

export function logout() {
  cookies().set(COOKIE, '', { path: '/', maxAge: 0 });
}

export async function createUser({ email, password, name, role = 'editor' }) {
  const users = await db.read('users');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || ''))) throw new Error('Email inválido.');
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) throw new Error('Ya existe un usuario con ese email.');
  if (!password || password.length < 8) throw new Error('La contraseña necesita al menos 8 caracteres.');
  const user = {
    id: db.nextId(users, 'u'),
    email: email.toLowerCase().trim(),
    name: name || email,
    role: PERMISSIONS[role] ? role : 'editor',
    passwordHash: await bcrypt.hash(password, 12),
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };
  await db.update('users', (list) => { list.push(user); });
  return user;
}

export async function setPassword(id, password) {
  if (!password || password.length < 8) throw new Error('La contraseña necesita al menos 8 caracteres.');
  const hash = await bcrypt.hash(password, 12);
  await db.update('users', (list) => { const u = list.find((x) => x.id === id); if (u) u.passwordHash = hash; });
}

/** Crea el admin inicial desde las variables de entorno si la tabla está vacía. */
export async function ensureSeedAdmin() {
  const users = await db.read('users');
  if (users.length) return;
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  await createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Administrador', role: 'admin' });
  console.log('✔ Administrador inicial creado:', ADMIN_EMAIL);
}
