import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="blk wrap" style={{ minHeight: '50vh' }}>
      <h1 className="display" style={{ fontSize: 'clamp(34px,6vw,60px)', margin: '0 0 12px' }}>Página no encontrada</h1>
      <p className="muted" style={{ marginBottom: 24 }}>El link que seguiste no existe o el producto ya no está publicado.</p>
      <Link href="/" className="btn btn-primary">Volver al inicio</Link>
    </section>
  );
}
