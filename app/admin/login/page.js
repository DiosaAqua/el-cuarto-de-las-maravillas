import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getSite } from '@/lib/shop';
import { doLogin } from '../actions';
import { ActionForm, Submit, Text } from '@/components/admin-ui';

export const metadata = { title: 'Ingresar al panel' };

export default async function Login() {
  if (await getUser()) redirect('/admin');
  const site = await getSite();
  return (
    <div className="login">
      <div className="box">
        <div className="brandmark" style={{ fontSize: 28, marginBottom: 4 }}>{site.brand.logoText}</div>
        <p className="muted" style={{ fontSize: 13, margin: '0 0 26px' }}>Panel de administración</p>
        <ActionForm action={doLogin}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Text label="Email" name="email" type="email" required autoComplete="username" autoFocus />
            <Text label="Contraseña" name="password" type="password" required autoComplete="current-password" />
            <Submit>Ingresar</Submit>
          </div>
        </ActionForm>
        <p className="muted" style={{ fontSize: 11.5, marginTop: 22 }}>
          Acceso restringido. Los intentos quedan registrados.
        </p>
      </div>
    </div>
  );
}
