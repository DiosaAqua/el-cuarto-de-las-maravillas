// Renombra las carpetas -slug- a [slug]. Se ejecuta solo (postinstall / predev / prebuild).
import fs from 'node:fs';
import path from 'node:path';

const APP = path.join(process.cwd(), 'app');
let n = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const from = path.join(dir, entry.name);
    const m = /^-(.+)-$/.exec(entry.name);
    if (m) {
      const to = path.join(dir, '[' + m[1] + ']');
      if (!fs.existsSync(to)) { fs.renameSync(from, to); n++; walk(to); continue; }
    }
    walk(from);
  }
}
if (fs.existsSync(APP)) walk(APP);
if (n) console.log('✔ rutas dinámicas normalizadas:', n);

// data/users.json no se versiona (guarda hashes de contraseñas reales). Si falta
// (clon nuevo), se crea vacío a partir de la plantilla — el admin inicial se
// autocrea con ADMIN_EMAIL/ADMIN_PASSWORD al primer arranque.
const usersFile = path.join(process.cwd(), 'data', 'users.json');
const usersTemplate = path.join(process.cwd(), 'data', 'users.json.example');
if (!fs.existsSync(usersFile) && fs.existsSync(usersTemplate)) {
  fs.copyFileSync(usersTemplate, usersFile);
  console.log('✔ data/users.json creado desde la plantilla');
}
