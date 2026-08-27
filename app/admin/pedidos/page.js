import { guard } from '../guard';
import * as db from '@/lib/db';
import { ARS } from '@/lib/format';
import { setOrderStatus } from '../actions';
import { ActionForm, Submit } from '@/components/admin-ui';

const ESTADOS = ['nuevo', 'confirmado', 'enviado', 'cerrado', 'cancelado'];

export default async function Pedidos() {
  await guard('orders');
  const orders = await db.read('orders');
  return (
    <>
      <h1>Pedidos</h1>
      <p className="sub">Se registran cuando el cliente aprieta “Finalizar por WhatsApp”.</p>
      {!orders.length && <p className="muted" style={{ padding: '30px 0' }}>Todavía no hay pedidos.</p>}
      {orders.map((o) => (
        <fieldset className="fs" key={o.id}>
          <legend>{o.id} · {new Date(o.createdAt).toLocaleString('es-AR')}</legend>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13.5, marginBottom: 8 }}>{o.customer.name || 'Sin nombre'} {o.customer.phone && '· ' + o.customer.phone}</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5 }}>
                {o.lines.map((l) => <li key={l.id}>{l.qty}× {l.name} — {ARS(l.price * l.qty)}</li>)}
              </ul>
              <div style={{ fontWeight: 600, marginTop: 10 }}>Total {ARS(o.subtotal)}</div>
            </div>
            <ActionForm action={setOrderStatus} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="hidden" name="id" value={o.id} />
              <select name="status" defaultValue={o.status} className="select">
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <Submit variant="btn-ghost">Actualizar</Submit>
            </ActionForm>
          </div>
        </fieldset>
      ))}
    </>
  );
}
