# Velure — contexto del proyecto

Tienda online premium (público adulto) en **Next.js 14 App Router**, JavaScript (sin TypeScript), sin base de datos.

## Stack y reglas
- Datos en JSON: `data/site.json`, `data/products.json`, `data/orders.json`, `data/users.json`, `data/subscribers.json`. Se leen/escriben con `lib/db.js` (`read`/`write`/`update`, todas `async` — siempre con `await`).
- Imágenes en `public/uploads/`, manejadas por `lib/storage.js` (`putImage`/`getImage`/`listImages`/`deleteImage`, todas `async`). No usar `fs` directo sobre `public/uploads` en ningún lado nuevo — pasa siempre por `lib/storage.js`.
- **Netlify:** tanto `lib/db.js` como `lib/storage.js` cambian de backend solos según `process.env.NETLIFY` (lo define Netlify, no hay que tocarlo) — en Netlify usan Netlify Blobs en vez de archivos locales, sin necesidad de cuenta ni configuración extra. Ver [DEPLOY_NETLIFY.md](DEPLOY_NETLIFY.md). El ruteo de imágenes en Netlify pasa por `app/uploads/[...path]/route.js`; en local, como los archivos siguen en `public/uploads/`, Next los sirve directo como estáticos.
- Auth propia con `bcryptjs` + cookie de sesión (`lib/auth.js`). Usuarios se crean con `npm run seed`.
- Checkout por **WhatsApp**: el carrito arma un mensaje y abre `wa.me`. Número configurable desde el admin (`data/site.json`).
- Estilos: CSS global en `app/globals.css` con variables. No añadir Tailwind ni librerías de UI.
- Textos de la interfaz en **español**.

## Estructura
- `app/page.js` — home (slider, categorías, destacados, búsqueda con sugerencias).
- `app/catalogo/page.js` — catálogo con filtros por categoría/marca/oferta/orden/búsqueda.
- `app/producto/[slug]/page.js` — ficha de producto.
- `app/pagina/[slug]/page.js` — páginas de contenido editables.
- `app/admin/*` — panel para usuarios no técnicos: productos, categorías, slider, páginas, medios, pedidos, usuarios, apariencia, cuenta.
- `components/` — Header, Footer, cart (cliente, localStorage), AddToCart, ProductCard, AgeGate, ImagePicker, admin-ui.
- `lib/shop.js` — lectura de datos y `filterProducts`. Marcado `server-only`.
- `lib/db.js` / `lib/storage.js` — persistencia de datos e imágenes; local vs. Netlify Blobs automático (ver arriba).
- `scripts/prepare-routes.mjs` — renombra carpetas `-slug-` a `[slug]` en postinstall/predev (por si el ZIP no preserva corchetes). **No borrar.**

## Cuidado con
- Todo lo que use `useState`, `onChange`, `onClick` debe estar en un archivo con `'use client'`. Pasar handlers desde un Server Component rompe la página (ese fue el bug del catálogo).
- Acceso al admin oculto a propósito: `Ctrl+Alt+A`, 5 clics en el copyright del footer, o entrar a `/admin`.
- Node.js ≥ 20.9.

## Comandos
```
npm install
npm run seed     # crear usuario admin
npm run dev
```
