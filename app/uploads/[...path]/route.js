import { NextResponse } from 'next/server';
import { getImage } from '@/lib/storage';

/**
 * Sirve imágenes subidas cuando vienen de Netlify Blobs (en local, los
 * archivos existen físicamente en public/uploads/ y Next los sirve como
 * estáticos antes de llegar acá).
 */
export async function GET(_req, { params }) {
  const filename = params.path.join('/');
  const img = await getImage(filename);
  if (!img) return new NextResponse('No encontrado', { status: 404 });
  return new NextResponse(img.buffer, {
    headers: {
      'Content-Type': img.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
