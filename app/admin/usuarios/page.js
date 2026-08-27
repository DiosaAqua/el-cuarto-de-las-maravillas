import { guard } from '../guard';
import * as db from '@/lib/db';
import { createUserAction, toggleUser, changePassword } from '../actions';
import { ActionForm, Submit, Text, Field } from '@/components/admin-ui';

export default async function Usuarios() {
  const me = await guard('users');
  const users = await db.read('users');
  return (
    <>
      <h1>Usuarios y roles</h1>
      <p className="sub">Sólo el administrador puede crear cuentas y cambiar roles.</p>

      <fieldset className="fs">
        <legend>Cuentas</legend>
        <table className="tbl">
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Último ingreso</th><th></th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}{u.id === me.id && <span className="muted"> (vos)</span>}</td>
                <td className="muted">{u.email}</td>
                <td><span className="tag" style={u.role === 'admin' ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' } : {}}>{u.role}</span></td>
                <td className="muted" style={{ fontSize: 12 }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString('es-AR') : 'nunca'}</td>
                <td>
                  <ActionForm action={toggleUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <Submit variant="btn-ghost" style={{ padding: '6px 10px', fontSize: 11.5 }}>{u.active ? 'Activo' : 'Inactivo'}</Submit>
                  </ActionForm>
                </td>
                <td>
                  <ActionForm action={changePassword} style={{ display: 'flex', gap: 6 }}>
                    <input type="hidden" name="id" value={u.id} />
                    <input name="password" type="password" placeholder="nueva clave" autoComplete="new-password"
                      style={{ font: 'inherit', fontSize: 12.5, padding: '7px 9px', border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--text)', width: 130 }} />
                    <Submit variant="btn-ghost" style={{ padding: '6px 10px', fontSize: 11.5 }}>Cambiar</Submit>
                  </ActionForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>

      <ActionForm action={createUserAction}>
        <fieldset className="fs">
          <legend>Nueva cuenta</legend>
          <div className="grid2">
            <Text label="Nombre" name="name" required />
            <Text label="Email" name="email" type="email" required />
            <Text label="Contraseña" name="password" type="password" required minLength={8} hint="mínimo 8 caracteres" autoComplete="new-password" />
            <Field label="Rol" hint="el editor no ve apariencia ni usuarios">
              <select name="role" defaultValue="editor">
                <option value="editor">Editor — catálogo y contenido</option>
                <option value="admin">Administrador — acceso total</option>
              </select>
            </Field>
          </div>
        </fieldset>
        <div className="bar"><Submit>Crear usuario</Submit></div>
      </ActionForm>
    </>
  );
}
