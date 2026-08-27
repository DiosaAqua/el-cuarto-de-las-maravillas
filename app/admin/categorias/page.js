import { guard } from '../guard';
import * as db from '@/lib/db';
import { saveCategories, addCategory } from '../actions';
import { ActionForm, Submit, Text } from '@/components/admin-ui';

export default async function Categorias() {
  await guard('content');
  const s = await db.read('site');
  const counts = (await db.read('products')).reduce((a, p) => ({ ...a, [p.category]: (a[p.category] || 0) + 1 }), {});
  return (
    <>
      <h1>Categorías y marcas</h1>
      <p className="sub">Definen los filtros del catálogo y la grilla del inicio.</p>

      <ActionForm action={saveCategories}>
        <fieldset className="fs">
          <legend>Categorías</legend>
          <table className="tbl">
            <thead><tr><th></th><th>Nombre</th><th>Imagen</th><th>Inicio</th><th>Productos</th></tr></thead>
            <tbody>
              {s.categories.map((c) => (
                <tr key={c.id}>
                  <td><img src={c.image} alt="" /><input type="hidden" name="catId" value={c.id} /></td>
                  <td><input name="catName" defaultValue={c.name} style={{ font: 'inherit', fontSize: 13.5, padding: '8px 10px', border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--text)', width: '100%' }} /></td>
                  <td><input name="catImage" defaultValue={c.image} style={{ font: 'inherit', fontSize: 12.5, padding: '8px 10px', border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--text)', width: '100%', fontFamily: 'ui-monospace,monospace' }} /></td>
                  <td><input type="checkbox" name="catHome" value={c.id} defaultChecked={c.showOnHome} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} /></td>
                  <td className="muted">{counts[c.id] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>Para eliminar una categoría, borrá su nombre y guardá.</p>
        </fieldset>

        <fieldset className="fs">
          <legend>Marcas</legend>
          <Text label="Marcas" name="brands" defaultValue={s.brands.join(', ')} hint="separadas por coma" />
        </fieldset>

        <div className="bar">
          <Submit>Guardar</Submit>
        </div>
      </ActionForm>
      <form action={addCategory} style={{ marginTop: 8 }}><button className="btn btn-ghost">+ Agregar categoría</button></form>
    </>
  );
}
