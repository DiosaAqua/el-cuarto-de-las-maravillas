# Deploy en Netlify

El proyecto detecta automáticamente si corre en Netlify (`process.env.NETLIFY`,
variable que pone Netlify solo) y en ese caso usa **Netlify Blobs** para guardar
todo lo que hoy vive en `data/*.json` y `public/uploads/`. No hace falta crear
cuenta ni conseguir credenciales para Blobs — funciona solo en cualquier sitio
de Netlify.

En local (`npm run dev`) nada cambia: se sigue usando `data/*.json` y
`public/uploads/` como siempre.

## 1. Conectar el sitio

1. Subí el repo a GitHub/GitLab (o el que uses) y conectalo en
   [app.netlify.com](https://app.netlify.com).
2. Build command: `npm run build` (ya queda declarado en `netlify.toml`, junto
   con el plugin oficial `@netlify/plugin-nextjs`).

## 2. Variables de entorno

En **Site settings → Environment variables**, las mismas que hoy tenés en
`.env.local`:

| Variable | Valor |
|---|---|
| `SESSION_SECRET` | el mismo string largo random que ya usás (o generá uno nuevo con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `ADMIN_EMAIL` | el email del admin inicial |
| `ADMIN_PASSWORD` | la contraseña del admin inicial |
| `NEXT_PUBLIC_SITE_URL` | la URL final del sitio en Netlify |

No hace falta ninguna variable extra para Blobs.

## 3. Primer deploy

Al primer deploy, el sitio arranca con Blobs **vacío** — el usuario admin se
crea solo (usa `ADMIN_EMAIL`/`ADMIN_PASSWORD`), pero el catálogo, categorías,
textos e imágenes no. Para llevar lo que ya tenés armado en esta máquina:

1. En el dashboard de Netlify: **Site settings → General → Site details**,
   copiá el **Site ID**.
2. **User settings → Applications → Personal access tokens**, generá un token
   nuevo.
3. Corré una vez, desde esta carpeta:

   ```bash
   NETLIFY_SITE_ID=el-site-id NETLIFY_AUTH_TOKEN=el-token node scripts/migrate-to-blobs.mjs
   ```

Esto copia `data/*.json` (productos, categorías, textos, usuarios) y todas las
fotos de `public/uploads/` al sitio real. Se puede correr de nuevo más
adelante si querés "resetear" el sitio en Netlify a lo que hay en esta
máquina — pisa lo que haya en Blobs.

## Después del primer deploy

Desde ahí en más, todo lo que se edite desde el panel de admin (productos,
imágenes, textos, apariencia) queda guardado en Netlify Blobs — persiste entre
visitas y entre deploys, igual que hoy persiste en los archivos locales.
