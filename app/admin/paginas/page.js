import { guard } from '../guard';
import * as db from '@/lib/db';
import { savePages } from '../actions';
import { ActionForm, Submit, Text } from '@/components/admin-ui';
import RichText from '@/components/RichText';

export default async function Paginas() {
  await guard('content');
  const pages = (await db.read('site')).pages;
  return (
    <>
      <h1>Páginas</h1>
      <p className="sub">Sobre nosotros, envíos, preguntas frecuentes, legales.</p>
      <ActionForm action={savePages}>
        {pages.map((p) => (
          <fieldset className="fs" key={p.slug}>
            <legend>/pagina/{p.slug}</legend>
            <input type="hidden" name="pageSlug" value={p.slug} />
            <div style={{ display: 'grid', gap: 14 }}>
              <div className="grid2">
                <Text label="Título" name="pageTitle" defaultValue={p.title} />
                <div className="f-row" style={{ alignSelf: 'end', paddingBottom: 10 }}>
                  <input type="checkbox" name="pagePub" value={p.slug} defaultChecked={p.published} id={'pub' + p.slug} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                  <label htmlFor={'pub' + p.slug}>Visible en el sitio</label>
                </div>
              </div>
              <RichText name="pageBody" label="Contenido" defaultValue={p.body} minHeight={170} />
            </div>
          </fieldset>
        ))}
        <div className="bar"><Submit /></div>
      </ActionForm>
    </>
  );
}
