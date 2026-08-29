import './globals.css';
import { getSite } from '@/lib/shop';
import { ensureSeedAdmin } from '@/lib/auth';
import CartProvider from '@/components/cart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeGate from '@/components/AgeGate';
import AdminBar from '@/components/AdminBar';
import IntroLogo from '@/components/IntroLogo';

export const dynamic = 'force-dynamic'; // el contenido lo edita el admin en caliente

export async function generateMetadata() {
  const s = await getSite();
  return {
    title: { default: s.brand.name + ' — ' + s.brand.tagline, template: '%s — ' + s.brand.name },
    description: s.brand.tagline,
    robots: { index: true },
  };
}

const themeCss = (t) => `:root{
--bg:${t.bg};--surface:${t.surface};--text:${t.text};--accent:${t.accent};
--accent-dark:${t.accentDark};--dark:${t.dark};--on-dark:${t.onDark};
--font-display:'${t.fontDisplay}',Georgia,serif;--font-ui:'${t.fontUI}',system-ui,sans-serif;
--display-style:${t.displayItalic ? 'italic' : 'normal'};--radius:${t.radius};
--hero-h:${t.heroHeight};--grid-gap:${t.gridGap};
--divider:color-mix(in srgb,${t.text} 30%,transparent);
--muted:color-mix(in srgb,${t.text} 58%,${t.bg});}
${t.bodyBgImage ? `body{background-image:url('${t.bodyBgImage}');background-size:cover;background-attachment:fixed}` : ''}`;

const fontHref = (t) => {
  const fam = (n) => 'family=' + n.trim().replace(/\s+/g, '+') + ':ital,wght@0,400;0,500;0,600;0,700;1,500;1,600';
  const uniq = [...new Set([t.fontDisplay, t.fontUI].filter(Boolean))];
  return 'https://fonts.googleapis.com/css2?' + uniq.map(fam).join('&') + '&display=swap';
};

export default async function RootLayout({ children }) {
  await ensureSeedAdmin();
  const site = await getSite();
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={fontHref(site.theme)} />
        <style dangerouslySetInnerHTML={{ __html: themeCss(site.theme) }} />
      </head>
      <body>
        <CartProvider site={{ brand: site.brand, checkout: site.checkout }}>
          <AgeGate config={site.ageGate} />
          <IntroLogo brand={site.brand} />
          <Header site={site} />
          <main>{children}</main>
          <Footer site={site} />
          <AdminBar />
        </CartProvider>
      </body>
    </html>
  );
}
