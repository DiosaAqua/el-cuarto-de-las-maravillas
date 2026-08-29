import { NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import * as db from '@/lib/db';
import * as storage from '@/lib/storage';

const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/** Subida de imágenes desde el propio formulario de producto (sin pasar por /admin/medios). */
export async function POST(req) {
  try {
    await auth.requirePermission('media');
  } catch {
    return NextResponse.json({ error: 'No tenés permisos para subir imágenes.' }, { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll('files').filter((f) => f && f.size);
  if (!files.length) return NextResponse.json({ error: 'Elegí al menos una imagen.' }, { status: 400 });

  const urls = [];
  for (const file of files) {
    if (!OK_TYPES.includes(file.type)) return NextResponse.json({ error: 'Formato no permitido: ' + file.type }, { status: 400 });
    if (file.size > 6 * 1024 * 1024) return NextResponse.json({ error: '"' + file.name + '" pesa más de 6 MB.' }, { status: 400 });
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const base = db.slugify(file.name.replace(/\.[^.]+$/, '')) || 'img';
    const filename = base + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '.' + ext;
    const url = await storage.putImage(filename, await file.arrayBuffer());
    urls.push(url);
  }
  return NextResponse.json({ urls });
}
