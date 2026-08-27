import { guard } from '../guard';
import { changePassword } from '../actions';
import { ActionForm, Submit, Text } from '@/components/admin-ui';

export default async function Cuenta() {
  const me = await guard(null);
  return (
    <>
      <h1>Mi cuenta</h1>
      <p className="sub">{me.name} · {me.email} · rol {me.role}</p>
      <ActionForm action={changePassword}>
        <fieldset className="fs">
          <legend>Cambiar mi contraseña</legend>
          <div style={{ maxWidth: 340 }}>
            <Text label="Nueva contraseña" name="password" type="password" required minLength={8} autoComplete="new-password" hint="mínimo 8 caracteres" />
          </div>
        </fieldset>
        <div className="bar"><Submit>Actualizar</Submit></div>
      </ActionForm>
    </>
  );
}
