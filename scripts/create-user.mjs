import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

const [email, password, role = 'admin'] = process.argv.slice(2);
if (!email || !password) {
  console.log('Uso: npm run seed -- email@dominio.com "contraseña" [admin|editor]');
  process.exit(1);
}
const file = path.join(process.cwd(), 'data', 'users.json');
const users = JSON.parse(fs.readFileSync(file, 'utf8'));
if (users.some((u) => u.email === email.toLowerCase())) { console.error('✖ Ese email ya existe.'); process.exit(1); }
users.push({
  id: 'u' + (users.length + 1), email: email.toLowerCase(), name: email, role,
  passwordHash: await bcrypt.hash(password, 12), active: true,
  createdAt: new Date().toISOString(), lastLogin: null,
});
fs.writeFileSync(file, JSON.stringify(users, null, 2));
console.log('✔ Usuario creado:', email, '(' + role + ')');
