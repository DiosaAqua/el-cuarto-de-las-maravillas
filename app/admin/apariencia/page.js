import { guard } from '../guard';
import * as db from '@/lib/db';
import { saveTheme } from '../actions';
import { ActionForm, Submit, Text, Check, Color, Field } from '@/components/admin-ui';
import SinglePicker from '@/components/SinglePicker';

const FUENTES = ['Archivo', 'Inter', 'Work Sans', 'DM Sans', 'Manrope', 'Libre Franklin', 'Space Grotesk', 'Cormorant Garamond', 'Playfair Display', 'EB Garamond', 'Lora', 'Spectral', 'Bodoni Moda', 'Marcellus'];

export default async function Apariencia() {
  await guard('appearance'); // sólo rol admin
  const t = (await db.read('site')).theme;
  return (
    <>
      <h1>Apariencia y tipografías</h1>
      <p className="sub">Colores, fuentes y fondos de toda la tienda. Sólo el administrador ve esta sección.</p>
      <p className="note">Las fuentes se cargan desde Google Fonts por nombre — si escribís una a mano, tiene que existir ahí.</p>

      <ActionForm action={saveTheme}>
        <fieldset className="fs">
          <legend>Colores</legend>
          <div className="grid3">
            <Color label="Fondo" name="bg" defaultValue={t.bg} />
            <Color label="Superficies" name="surface" defaultValue={t.surface} hint="placeholders" />
            <Color label="Texto" name="text" defaultValue={t.text} />
            <Color label="Acento" name="accent" defaultValue={t.accent} hint="botones y precios" />
            <Color label="Acento oscuro" name="accentDark" defaultValue={t.accentDark} hint="hover y links" />
            <Color label="Bloques oscuros" name="dark" defaultValue={t.dark} />
            <Color label="Texto sobre oscuro" name="onDark" defaultValue={t.onDark} />
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Tipografías</legend>
          <div className="grid2">
            <Field label="Fuente de títulos" hint="hero, precios grandes">
              <select name="fontDisplay" defaultValue={t.fontDisplay}>
                {FUENTES.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Fuente de interfaz" hint="textos, botones, menús">
              <select name="fontUI" defaultValue={t.fontUI}>
                {FUENTES.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ marginTop: 16 }}>
            <Check label="Títulos en itálica" name="displayItalic" defaultChecked={t.displayItalic} />
          </div>
          <div style={{ marginTop: 22, padding: 22, border: '2px solid var(--divider)' }}>
            <div className="kicker muted">Vista previa</div>
            <p className="display" style={{ fontSize: 40, margin: '10px 0 6px' }}>Placer, en su forma más refinada</p>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>Así se ve la combinación actual de fuentes. Guardá para aplicarla al sitio.</p>
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Formas y fondos</legend>
          <div className="grid3">
            <Text label="Redondeo" name="radius" defaultValue={t.radius} hint="0px = esquinas rectas" />
            <Text label="Alto del hero" name="heroHeight" defaultValue={t.heroHeight} hint="ej. 82vh" />
            <Text label="Separación de la grilla" name="gridGap" defaultValue={t.gridGap} hint="ej. 22px" />
          </div>
          <div className="f" style={{ marginTop: 16 }}>
            <label>Imagen de fondo del sitio<span className="hint"> — opcional</span></label>
            <SinglePicker name="bodyBgImage" defaultValue={t.bodyBgImage} ratio="16/9" />
          </div>
        </fieldset>

        <div className="bar"><Submit>Aplicar al sitio</Submit></div>
      </ActionForm>
    </>
  );
}
