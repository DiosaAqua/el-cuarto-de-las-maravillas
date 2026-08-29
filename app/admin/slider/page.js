import { guard } from '../guard';
import * as db from '@/lib/db';
import { listUploads } from '@/lib/shop';
import { saveHero, addSlide, deleteSlide } from '../actions';
import { ActionForm, Submit, Text, Area } from '@/components/admin-ui';
import SinglePicker from '@/components/SinglePicker';

export default async function Slider() {
  await guard('content');
  const slides = (await db.read('site')).hero;
  const library = await listUploads();
  return (
    <>
      <h1>Slider del inicio</h1>
      <p className="sub">Subí la foto de cada slide directamente acá, o elegí una que ya hayas subido antes.</p>

      <ActionForm action={saveHero}>
        {slides.map((s, i) => (
          <fieldset className="fs" key={s.id}>
            <legend>Slide {i + 1}</legend>
            <input type="hidden" name="slideId" value={s.id} />
            <div className="grid2">
              <Text label="Bajada" name="kicker" defaultValue={s.kicker} />
              <Text label="Título línea 1" name="title1" defaultValue={s.title1} />
              <Text label="Título línea 2" name="title2" defaultValue={s.title2} />
              <Text label="Texto del botón" name="cta" defaultValue={s.cta} />
              <Text label="Link del botón" name="href" defaultValue={s.href} />
            </div>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
              <Area label="Texto" name="copy" defaultValue={s.copy} style={{ minHeight: 80 }} />
              <SinglePicker name="image" defaultValue={s.image} library={library} ratio="16/10" />
            </div>
          </fieldset>
        ))}
        <div className="bar"><Submit>Guardar slider</Submit></div>
      </ActionForm>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
        <form action={addSlide}><button className="btn btn-ghost">+ Agregar slide</button></form>
        {slides.length > 1 && (
          <ActionForm action={deleteSlide}>
            <input type="hidden" name="id" value={slides[slides.length - 1].id} />
            <Submit variant="btn-ghost">Eliminar la última</Submit>
          </ActionForm>
        )}
      </div>
    </>
  );
}
