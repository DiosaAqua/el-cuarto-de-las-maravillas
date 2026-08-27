import Link from 'next/link';
import { getUser, can } from '@/lib/auth';
import { getSite } from '@/lib/shop';
import { doLogout } from './actions';

export const metadata = { title: 'Panel', robots: { index: false, follow: false } };

const NAV = [
  { group: 'Catálogo', items: [
    { href: '/admin/productos', label: 'Productos', perm: 'products' },
    { href: '/admin/categorias', label: 'Categorías y marcas', perm: 'content' },
    { href: '/admin/pedidos', label: 'Pedidos', perm: 'orders' },
  ]},
  { group: 'Contenido', items: [
    { href: '/admin/contenido', label: 'Textos del sitio', perm: 'content' },
    { href: '/admin/slider', label: 'Slider del inicio', perm: 'content' },
    { href: '/admin/paginas', label: 'Páginas', perm: 'content' },
    { href: '/admin/medios', label: 'Imágenes', perm: 'media' },
  ]},
  { group: 'Configuración', items: [
    { href: '/admin/apariencia', label: 'Apariencia y tipografías', perm: 'appearance' },
    { href: '/admin/usuarios', label: 'Usuarios y roles', perm: 'users' },
    { href: '/admin/cuenta', label: 'Mi cuenta', perm: null },
  ]},
];

export default async function AdminLayout({ children }) {
  const user = await getUser();
  if (!user) return <>{children}</>; // la pantalla de login se dibuja sola
  const site = await getSite();
  return (
    <div className="adm">
      <aside>
        <div className="who">
          <Link href="/" className="brandmark" style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            {site.brand.logoImage && <img src={site.brand.logoImage} alt="" style={{ height: 40 }} />}
            <span>{site.brand.logoText}</span>
          </Link>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 8 }}>{user.name}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>
            {user.role === 'admin' ? 'Administrador — acceso total' : 'Editor — catálogo y contenido'}
          </div>
        </div>
        <nav>
          {NAV.map((g) => {
            const items = g.items.filter((i) => !i.perm || can(user, i.perm));
            if (!items.length) return null;
            return (
              <div key={g.group}>
                <div className="grp">{g.group}</div>
                {items.map((i) => <Link key={i.href} href={i.href}>{i.label}</Link>)}
              </div>
            );
          })}
          <div className="grp">Sitio</div>
          <Link href="/" target="_blank">Ver la tienda ↗</Link>
          <form action={doLogout} style={{ padding: '14px 20px' }}>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Cerrar sesión</button>
          </form>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
