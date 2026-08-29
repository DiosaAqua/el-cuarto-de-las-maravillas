import { guard } from '../guard';
import * as db from '@/lib/db';
import { listUploads } from '@/lib/shop';
import { saveCategories, addCategory } from '../actions';
import { ActionForm, Submit, Text } from '@/components/admin-ui';
import SinglePicker from '@/components/SinglePicker';

export default async function Categorias() {
  await guard('content');
  const s = await db.read('site');
  const counts = (await db.read('products')).reduce((a, p) => ({ ...a, [p.category]: (a[p.category] || 0) + 1 }), {});
  const library = await listUploads();
  return (
    <>
      <h1>Categorías y marcas</h1>
      <p className="sub">Definen los filtros del catálogo y la grilla del inicio.</p>

      <ActionForm action={saveCategories}>
        <fieldset className="fs">
          <legend>Categorías</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {s.categories.map((c) => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 90px 90px', gap: 16, alignItems: 'start', paddingBottom: 18, borderBottom: '1px solid var(--divider)' }}>
                <input type="hidden" name="catId" value={c.id} />
                <SinglePicker name="catImage" defaultValue={c.image} library={library} ratio="1/1" />
                <div className="f">
                  <label>Nombre</label>
                  <input name="catName" defaultValue={c.name} style={{ font: 'inherit', fontSize: 13.5, padding: '8px 10px', border: '1px solid var(--divider)', background: 'var(--bg)', color: 'var(--text)', width: '100%' }} />
                </div>
                <div className="f-row" style={{ marginTop: 26 }}>
                  <input type="checkbox" id={'catHome' + c.id} name="catHome" value={c.id} defaultChecked={c.showOnHome} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                  <label htmlFor={'catHome' + c.id}>Mostrar en inicio</label>
                </div>
                <div className="muted" style={{ marginTop: 26, fontSize: 13 }}>{counts[c.id] || 0} producto(s)</div>
              </div>
            ))}
          </div>
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
