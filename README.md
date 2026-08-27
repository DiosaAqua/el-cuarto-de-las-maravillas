# Velure — tienda Next.js con panel de administración

Tienda propia en Next.js 14 (App Router). El dueño del comercio edita **productos, textos,
descripciones, imágenes, colores, tipografías, fondos, categorías, páginas y datos de contacto**
desde `/admin`, sin tocar código. El carrito termina en un pedido armado por WhatsApp.

## Puesta en marcha

```bash
cd next-app
npm install
cp .env.example .env.local     # completá SESSION_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD
npm run dev                    # http://localhost:3000  ·  panel: /admin
```

Generá el secreto de sesión con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

La primera vez que arranca, la app crea el usuario administrador con `ADMIN_EMAIL` /
`ADMIN_PASSWORD`. **Cambiá esa contraseña desde el panel** (Mi cuenta) y después borrá la
variable. Para crear cuentas desde la terminal:

```bash
npm run seed -- alguien@dominio.com "contraseña-larga" editor
```

## Roles

| | admin | editor |
|---|---|---|
| Productos, categorías, pedidos | ✔ | ✔ |
| Textos, slider, páginas, imágenes | ✔ | ✔ |
| Apariencia y tipografías | ✔ | — |
| Usuarios y roles | ✔ | — |

El control está en el servidor (`lib/auth.js` → `requirePermission`), no sólo en el menú: un
editor que escriba la URL `/admin/apariencia` a mano igual queda afuera.

## Dónde vive el contenido

| Archivo | Qué guarda |
|---|---|
| `data/site.json` | marca, contacto, tema (colores/fuentes/fondos), slider, secciones, categorías, páginas |
| `data/products.json` | catálogo completo |
| `data/users.json` | cuentas con hash bcrypt |
| `data/orders.json` | pedidos registrados antes de pasar a WhatsApp |
| `public/uploads/` | imágenes subidas desde el panel |

Escritura atómica con backup automático (`*.bak.json`). **Hacé copia de `data/` y
`public/uploads/` periódicamente** — ahí está toda la tienda. Si el catálogo crece mucho, se
cambia sólo `lib/db.js` por SQLite o Postgres: el resto de la app usa `read / write / update`.

## Subirlo a hosting (vexyhost y cPanel en general)

Necesitás un plan con **Node.js ≥ 20** (en cPanel: "Setup Node.js App" / Passenger).

1. Subí la carpeta `next-app` completa, sin `node_modules` ni `.next`.
2. cPanel → Setup Node.js App: *Application root* = la carpeta subida; *Application startup file* = `node_modules/next/dist/bin/next` con argumento `start`, o dejá que corra `npm start`.
3. Variables de entorno en el mismo panel: `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NODE_ENV=production`.
4. Desde la consola del panel: `npm install` y después `npm run build`.
5. Arrancá la app.

Importante en hosting compartido: la app **escribe en disco** (`data/`, `public/uploads/`), así
que esas carpetas necesitan permiso de escritura y no deben resetearse en cada deploy. Si el plan
resulta de sólo lectura o efímero, avisame y lo migro a Postgres + imágenes en almacenamiento
externo.

## Estructura

```
app/
  page.js                inicio (slider, categorías, novedades, promos, destacados)
  catalogo/              listado con filtros por categoría, marca, oferta y orden
  producto/[slug]/       ficha con galería, cuotas, especificaciones
  pagina/[slug]/         páginas de contenido
  api/orders             registra el pedido antes de ir a WhatsApp
  api/newsletter         alta de suscriptores
  admin/                 panel protegido: login, productos, contenido, slider, categorías,
                         páginas, imágenes, apariencia, usuarios, pedidos, mi cuenta
components/              header, footer, carrito, hero, ficha, formularios del panel
lib/                     db (JSON), auth (bcrypt + cookie firmada), shop, format
```

Nota: las carpetas de rutas dinámicas viajan como `-slug-` / `-id-` y el script
`scripts/prepare-routes.mjs` las renombra a `[slug]` / `[id]` en el `postinstall`. No hace
falta correrlo a mano.

## Seguridad

- Contraseñas con bcrypt (12 rondas), nunca en claro.
- Sesión en cookie `httpOnly` + `SameSite=Lax`, firmada con HMAC-SHA256, vencimiento 12 h.
- Comparación de hash en tiempo constante y siempre ejecutada, para no filtrar si un email existe.
- Subida de imágenes con lista blanca de tipos y límite de 6 MB.
- El panel está marcado `noindex`.
