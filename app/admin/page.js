import Link from 'next/link';
import { guard } from './guard';
import * as db from '@/lib/db';

export default async function Dashboard({ searchParams }) {
  const user = await guard(null);
  const products = await db.read('products');
  const noStock = products.filter((p) => p.stock < 1);
  return (
    <>
      <h1>Hola, {user.name.split(' ')[0]}</h1>
      <p className="sub">Todo lo que editás acá se publica en la tienda al instante.</p>

      {searchParams.denied && (
        <p className="err">Tu rol ({user.role}) no tiene acceso a esa sección. Pedile al administrador que te la habilite.</p>
      )}

      <div className="grid3" style={{ marginBottom: 30, maxWidth: 220 }}>
        <div className="stat"><b>{products.filter((p) => p.published).length}</b><span>Productos publicados</span></div>
      </div>

      {!!noStock.length && (
        <p className="note">
          <strong>{noStock.length} producto(s) sin stock:</strong> {noStock.slice(0, 4).map((p) => p.name).join(', ')}
          {noStock.length > 4 ? '…' : ''} — <Link href="/admin/productos">revisar</Link>
        </p>
      )}

      <fieldset className="fs">
        <legend>Accesos rápidos</legend>
        <div className="grid2" style={{ marginTop: 14 }}>
          <Link className="btn btn-ghost" href="/admin/productos/nuevo">+ Cargar un producto</Link>
          <Link className="btn btn-ghost" href="/admin/contenido">Editar textos del sitio</Link>
          <Link className="btn btn-ghost" href="/admin/medios">Subir imágenes</Link>
          {user.role === 'admin' && <Link className="btn btn-ghost" href="/admin/apariencia">Colores y tipografías</Link>}
        </div>
      </fieldset>
    </>
  );
}
