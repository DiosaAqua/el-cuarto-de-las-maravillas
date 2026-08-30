'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as db from '@/lib/db';
import * as auth from '@/lib/auth';
import * as storage from '@/lib/storage';

const str = (v, max = 400) => String(v ?? '').trim().slice(0, max);
const num = (v) => (v === '' || v == null ? null : Number(v));
const bool = (v) => v === 'on' || v === 'true' || v === true;
/** Limpia el HTML que llega del editor visual: nada de scripts ni handlers. */
const html = (v, max = 20000) =>
  String(v ?? '')
    .replace(/<\/?(script|style|iframe|object|embed|form)[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, max);
const fail = (msg) => ({ error: msg });
const done = (msg) => ({ ok: msg });

function refresh() {
  revalidatePath('/', 'layout');
}

/* ---------- sesión ---------- */
export async function doLogin(prev, form) {
  const user = await auth.login(form.get('email'), form.get('password'));
  if (!user) return fail('Email o contraseña incorrectos.');
  redirect('/admin');
}

export async function doLogout() {
  auth.logout();
  redirect('/admin/login');
}

/* ---------- productos ---------- */
export async function saveProduct(prev, form) {
  try { await auth.requirePermission('products'); } catch { return fail('No tenés permisos sobre el catálogo.'); }
  const id = str(form.get('id'), 20);
  const name = str(form.get('name'), 160);
  if (!name) return fail('El nombre es obligatorio.');
  const price = num(form.get('price'));
  if (!price || price <= 0) return fail('Poné un precio válido.');
  const images = str(form.get('images'), 2000).split('\n').map((s) => s.trim()).filter(Boolean);
  const specs = str(form.get('specs'), 2000).split('\n').map((l) => l.split('|'))
    .filter((p) => p[0]?.trim()).map(([k, v]) => ({ k: k.trim(), v: (v || '').trim() }));

  const patch = {
    name,
    slug: str(form.get('slug'), 80) || db.slugify(name),
    category: str(form.get('category'), 40),
    brand: str(form.get('brand'), 60),
    price,
    oldPrice: num(form.get('oldPrice')) || null,
    stock: Math.max(0, num(form.get('stock')) || 0),
    sku: str(form.get('sku'), 40),
    installments: Math.max(1, num(form.get('installments')) || 1),
    freeShipping: bool(form.get('freeShipping')),
    featured: bool(form.get('featured')),
    published: bool(form.get('published')),
    badge: str(form.get('badge'), 30) || null,
    shortDescription: str(form.get('shortDescription'), 300),
    description: html(form.get('description'), 8000),
    images: images.length ? images : ['/uploads/tex-p1.webp'],
    specs,
  };

  await db.update('products', (list) => {
    if (id) {
      const i = list.findIndex((p) => p.id === id);
      if (i >= 0) list[i] = { ...list[i], ...patch };
    } else {
      list.push({ id: db.nextId(list, 'p'), createdAt: new Date().toISOString(), colors: [], ...patch });
    }
  });
  refresh();
  redirect('/admin/productos?ok=1');
}

/** Vuelve al listado de productos preservando la búsqueda y la página en la
 *  que estaba — así el admin no "salta" al principio de 2000+ productos
 *  después de tocar un botón. */
const backToList = (form) => {
  const qs = new URLSearchParams();
  const q = str(form.get('q'), 200);
  const page = str(form.get('page'), 10);
  if (q) qs.set('q', q);
  if (page && page !== '1') qs.set('page', page);
  const query = qs.toString();
  redirect('/admin/productos' + (query ? '?' + query : ''));
};

export async function deleteProduct(form) {
  try { await auth.requirePermission('products'); } catch { return; }
  const id = str(form.get('id'), 20);
  await db.update('products', (list) => list.filter((p) => p.id !== id));
  refresh();
  backToList(form);
}

export async function togglePublished(form) {
  try { await auth.requirePermission('products'); } catch { return; }
  const id = str(form.get('id'), 20);
  await db.update('products', (list) => { const p = list.find((x) => x.id === id); if (p) p.published = !p.published; });
  refresh();
  backToList(form);
}

/* ---------- contenido (textos del sitio) ---------- */
export async function saveContent(prev, form) {
  try { await auth.requirePermission('content'); } catch { return fail('No tenés permisos sobre el contenido.'); }
  await db.update('site', (s) => {
    s.brand.name = str(form.get('brandName'), 60) || s.brand.name;
    s.brand.logoText = str(form.get('logoText'), 60) || s.brand.logoText;
    s.brand.logoImage = str(form.get('logoImage'), 200);
    s.brand.tagline = str(form.get('tagline'), 200);
    s.brand.email = str(form.get('email'), 120);
    s.brand.whatsapp = str(form.get('whatsapp'), 30).replace(/[^0-9]/g, '');
    s.brand.instagram = str(form.get('instagram'), 200);
    s.brand.address = str(form.get('address'), 160);

    s.topbar.enabled = bool(form.get('topbarEnabled'));
    s.topbar.items = str(form.get('topbarItems'), 600).split('\n').map((x) => x.trim()).filter(Boolean);

    for (const k of ['categoriesTitle', 'categoriesLink', 'newTitle', 'newSubtitle', 'featuredTitle', 'featuredSubtitle'])
      s.sections[k] = str(form.get(k), 200);
    for (const k of ['showCategories', 'showNew', 'showPromo', 'showFeatured', 'showTrust', 'showNewsletter'])
      s.sections[k] = bool(form.get(k));

    for (const k of ['kicker', 'title1', 'title2', 'copy', 'cta', 'href']) s.promo[k] = str(form.get('promo_' + k), 300);
    for (const k of ['kicker', 'title', 'copy', 'cta']) s.newsletter[k] = str(form.get('news_' + k), 300);

    s.trust = str(form.get('trust'), 800).split('\n').map((l) => l.split('|'))
      .filter((p) => p[1]?.trim()).map(([icon, title]) => ({ icon: icon.trim().slice(0, 4), title: title.trim() }));

    s.checkout.whatsappMessage = str(form.get('waMessage'), 200);
    s.checkout.shippingCost = Math.max(0, num(form.get('shippingCost')) || 0);
    s.checkout.freeShippingFrom = Math.max(0, num(form.get('freeShippingFrom')) || 0);

    s.footer.copyright = str(form.get('copyright'), 160);
    s.footer.payments = str(form.get('payments'), 300).split(',').map((x) => x.trim()).filter(Boolean);

    s.ageGate.enabled = bool(form.get('ageEnabled'));
    s.ageGate.title = str(form.get('ageTitle'), 120);
    s.ageGate.copy = str(form.get('ageCopy'), 300);
  });
  refresh();
  return done('Contenido guardado.');
}

/* ---------- hero (slider) ---------- */
export async function saveHero(prev, form) {
  try { await auth.requirePermission('content'); } catch { return fail('No tenés permisos.'); }
  const ids = form.getAll('slideId');
  await db.update('site', (s) => {
    s.hero = ids.map((id, i) => ({
      id: id || 'h' + (i + 1),
      kicker: str(form.getAll('kicker')[i], 80),
      title1: str(form.getAll('title1')[i], 80),
      title2: str(form.getAll('title2')[i], 80),
      copy: str(form.getAll('copy')[i], 300),
      cta: str(form.getAll('cta')[i], 40) || 'Comprar ahora',
      href: str(form.getAll('href')[i], 200) || '/catalogo',
      image: str(form.getAll('image')[i], 300),
    })).filter((sl) => sl.title1 || sl.title2);
  });
  refresh();
  return done('Slider actualizado.');
}

export async function addSlide() {
  try { await auth.requirePermission('content'); } catch { return; }
  await db.update('site', (s) => {
    s.hero.push({ id: 'h' + Date.now().toString(36), kicker: 'Nuevo', title1: 'Título', title2: 'de la campaña',
      copy: '', cta: 'Comprar ahora', href: '/catalogo', image: '/uploads/tex-hero1.webp' });
  });
  revalidatePath('/admin/slider');
}

export async function deleteSlide(prev, form) {
  try { await auth.requirePermission('content'); } catch { return fail('No tenés permisos.'); }
  const id = str(form.get('id'), 30);
  await db.update('site', (s) => { s.hero = s.hero.filter((x) => x.id !== id); });
  refresh();
  return done('Slide eliminada.');
}

/* ---------- categorías ---------- */
export async function saveCategories(prev, form) {
  try { await auth.requirePermission('content'); } catch { return fail('No tenés permisos.'); }
  const ids = form.getAll('catId');
  await db.update('site', (s) => {
    s.categories = ids.map((id, i) => ({
      id: id || db.slugify(form.getAll('catName')[i]),
      name: str(form.getAll('catName')[i], 60),
      image: str(form.getAll('catImage')[i], 300),
      showOnHome: form.getAll('catHome').includes(id),
    })).filter((c) => c.name);
    s.brands = str(form.get('brands'), 400).split(',').map((x) => x.trim()).filter(Boolean);
  });
  refresh();
  return done('Categorías guardadas.');
}

export async function addCategory() {
  try { await auth.requirePermission('content'); } catch { return; }
  await db.update('site', (s) => {
    s.categories.push({ id: 'cat' + Date.now().toString(36), name: 'Nueva categoría', image: '/uploads/tex-p1.webp', showOnHome: false });
  });
  revalidatePath('/admin/categorias');
}

/* ---------- páginas de contenido ---------- */
export async function savePages(prev, form) {
  try { await auth.requirePermission('content'); } catch { return fail('No tenés permisos.'); }
  const slugs = form.getAll('pageSlug');
  await db.update('site', (s) => {
    s.pages = slugs.map((slug, i) => ({
      slug: slug || db.slugify(form.getAll('pageTitle')[i]),
      title: str(form.getAll('pageTitle')[i], 120),
      body: html(form.getAll('pageBody')[i], 20000),
      published: form.getAll('pagePub').includes(slug),
    })).filter((p) => p.title);
  });
  refresh();
  return done('Páginas guardadas.');
}

/* ---------- apariencia (sólo admin) ---------- */
export async function saveTheme(prev, form) {
  try { await auth.requirePermission('appearance'); } catch { return fail('Sólo el administrador puede cambiar la apariencia.'); }
  await db.update('site', (s) => {
    for (const k of ['bg', 'surface', 'text', 'accent', 'accentDark', 'dark', 'onDark'])
      s.theme[k] = str(form.get(k), 30) || s.theme[k];
    s.theme.fontDisplay = str(form.get('fontDisplay'), 60) || s.theme.fontDisplay;
    s.theme.fontUI = str(form.get('fontUI'), 60) || s.theme.fontUI;
    s.theme.displayItalic = bool(form.get('displayItalic'));
    s.theme.radius = str(form.get('radius'), 12) || '0px';
    s.theme.heroHeight = str(form.get('heroHeight'), 12) || '82vh';
    s.theme.gridGap = str(form.get('gridGap'), 12) || '22px';
    s.theme.bodyBgImage = str(form.get('bodyBgImage'), 300);
  });
  refresh();
  return done('Apariencia guardada.');
}

/* ---------- medios ---------- */
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export async function uploadImages(prev, form) {
  try { await auth.requirePermission('media'); } catch { return fail('No tenés permisos para subir imágenes.'); }
  const files = form.getAll('files').filter((f) => f && f.size);
  if (!files.length) return fail('Elegí al menos una imagen.');
  const saved = [];
  for (const file of files) {
    if (!OK_TYPES.includes(file.type)) return fail('Formato no permitido: ' + file.type);
    if (file.size > 6 * 1024 * 1024) return fail('“' + file.name + '” pesa más de 6 MB.');
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const base = db.slugify(file.name.replace(/\.[^.]+$/, '')) || 'img';
    const filename = base + '-' + Date.now().toString(36) + '.' + ext;
    const url = await storage.putImage(filename, await file.arrayBuffer());
    saved.push(url);
  }
  refresh();
  return done(saved.length + ' imagen(es) subida(s).');
}

export async function deleteImage(prev, form) {
  try { await auth.requirePermission('media'); } catch { return fail('No tenés permisos.'); }
  const name = str(form.get('name'), 200).replace(/^.*[\\/]/, '');
  const used = JSON.stringify(await db.read('products')) + JSON.stringify(await db.read('site'));
  if (used.includes('/uploads/' + name)) return fail('Esa imagen está en uso. Quitala del producto o sección primero.');
  const ok = await storage.deleteImage(name);
  if (!ok) return fail('No se pudo borrar.');
  return done('Imagen eliminada.');
}

/* ---------- usuarios (sólo admin) ---------- */
export async function createUserAction(prev, form) {
  try { await auth.requirePermission('users'); } catch { return fail('Sólo el administrador gestiona usuarios.'); }
  try {
    await auth.createUser({
      email: str(form.get('email'), 120), password: String(form.get('password') || ''),
      name: str(form.get('name'), 80), role: str(form.get('role'), 10),
    });
    return done('Usuario creado.');
  } catch (e) { return fail(e.message); }
}

export async function toggleUser(prev, form) {
  try { await auth.requirePermission('users'); } catch { return fail('Sin permisos.'); }
  const me = await auth.getUser();
  const id = str(form.get('id'), 20);
  if (id === me.id) return fail('No podés desactivar tu propia cuenta.');
  await db.update('users', (list) => { const u = list.find((x) => x.id === id); if (u) u.active = !u.active; });
  return done('Usuario actualizado.');
}

export async function changePassword(prev, form) {
  const me = await auth.getUser();
  if (!me) return fail('Sesión expirada.');
  const target = str(form.get('id'), 20) || me.id;
  if (target !== me.id) { try { await auth.requirePermission('users'); } catch { return fail('Sin permisos.'); } }
  try { await auth.setPassword(target, String(form.get('password') || '')); return done('Contraseña actualizada.'); }
  catch (e) { return fail(e.message); }
}

/* ---------- pedidos ---------- */
export async function setOrderStatus(prev, form) {
  try { await auth.requirePermission('orders'); } catch { return fail('Sin permisos.'); }
  const id = str(form.get('id'), 30), status = str(form.get('status'), 20);
  await db.update('orders', (list) => { const o = list.find((x) => x.id === id); if (o) o.status = status; });
  revalidatePath('/admin/pedidos');
  return done('Pedido actualizado.');
}
