import { guard } from '../guard';
import * as db from '@/lib/db';
import { saveContent } from '../actions';
import { ActionForm, Submit, Text, Area, Check } from '@/components/admin-ui';
import Rows from '@/components/Rows';

export default async function Contenido() {
  await guard('content');
  const s = await db.read('site');
  return (
    <>
      <h1>Textos del sitio</h1>
      <p className="sub">Todo lo que se lee en la tienda, sin tocar código.</p>

      <ActionForm action={saveContent}>
        <fieldset className="fs">
          <legend>Marca y contacto</legend>
          <div className="grid2">
            <Text label="Nombre del negocio" name="brandName" defaultValue={s.brand.name} />
            <Text label="Texto del logo" name="logoText" defaultValue={s.brand.logoText} hint="se usa como texto alternativo y si no hay imagen de logo" />
            <Text label="Email" name="email" type="email" defaultValue={s.brand.email} />
            <Text label="WhatsApp" name="whatsapp" defaultValue={s.brand.whatsapp} hint="con código de país, sin + ni espacios" />
            <Text label="Instagram" name="instagram" defaultValue={s.brand.instagram} hint="URL completa" />
            <Text label="Ciudad / dirección" name="address" defaultValue={s.brand.address} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Area label="Frase de marca" name="tagline" defaultValue={s.brand.tagline} style={{ minHeight: 60 }} />
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 90px', gap: 16, alignItems: 'end' }}>
            <Text label="Imagen del logo" name="logoImage" defaultValue={s.brand.logoImage} hint="/uploads/… — subila primero en “Imágenes”. Vacío = se usa el texto del logo" />
            {s.brand.logoImage && <img src={s.brand.logoImage} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, background: 'var(--surface)' }} />}
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Barra superior</legend>
          <Check label="Mostrar la barra de avisos arriba de todo" name="topbarEnabled" defaultChecked={s.topbar.enabled} />
          <div style={{ marginTop: 16 }}>
            <Rows name="topbarItems" label="Avisos" hint="aparecen separados por puntos"
              cols={[{ label: 'Texto del aviso', placeholder: 'Envíos 100% discretos' }]}
              rows={s.topbar.items.map((t) => [t])} addLabel="+ Agregar aviso" />
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Secciones del inicio</legend>
          <div className="grid2">
            <Text label="Título de categorías" name="categoriesTitle" defaultValue={s.sections.categoriesTitle} />
            <Text label="Link de categorías" name="categoriesLink" defaultValue={s.sections.categoriesLink} />
            <Text label="Título de novedades" name="newTitle" defaultValue={s.sections.newTitle} />
            <Text label="Subtítulo de novedades" name="newSubtitle" defaultValue={s.sections.newSubtitle} />
            <Text label="Título de destacados" name="featuredTitle" defaultValue={s.sections.featuredTitle} />
            <Text label="Subtítulo de destacados" name="featuredSubtitle" defaultValue={s.sections.featuredSubtitle} />
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 18 }}>
            <Check label="Categorías" name="showCategories" defaultChecked={s.sections.showCategories} />
            <Check label="Novedades" name="showNew" defaultChecked={s.sections.showNew} />
            <Check label="Promos" name="showPromo" defaultChecked={s.sections.showPromo} />
            <Check label="Destacados" name="showFeatured" defaultChecked={s.sections.showFeatured} />
            <Check label="Garantías" name="showTrust" defaultChecked={s.sections.showTrust} />
            <Check label="Newsletter" name="showNewsletter" defaultChecked={s.sections.showNewsletter} />
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Bloque de promociones</legend>
          <div className="grid2">
            <Text label="Bajada" name="promo_kicker" defaultValue={s.promo.kicker} />
            <Text label="Título línea 1" name="promo_title1" defaultValue={s.promo.title1} />
            <Text label="Título línea 2" name="promo_title2" defaultValue={s.promo.title2} />
            <Text label="Texto del botón" name="promo_cta" defaultValue={s.promo.cta} />
            <Text label="Link del botón" name="promo_href" defaultValue={s.promo.href} />
          </div>
          <div style={{ marginTop: 16 }}><Area label="Texto" name="promo_copy" defaultValue={s.promo.copy} style={{ minHeight: 70 }} /></div>
        </fieldset>

        <fieldset className="fs">
          <legend>Garantías</legend>
          <Rows name="trust" label="Ítems" hint="el símbolo se muestra arriba del texto"
            cols={[{ label: 'Símbolo', placeholder: '✉', width: '90px' }, { label: 'Texto', placeholder: 'Envíos 100% discretos' }]}
            rows={s.trust.map((t) => [t.icon, t.title])} addLabel="+ Agregar garantía" />
        </fieldset>

        <fieldset className="fs">
          <legend>Newsletter</legend>
          <div className="grid2">
            <Text label="Bajada" name="news_kicker" defaultValue={s.newsletter.kicker} />
            <Text label="Título" name="news_title" defaultValue={s.newsletter.title} />
            <Text label="Texto del botón" name="news_cta" defaultValue={s.newsletter.cta} />
          </div>
          <div style={{ marginTop: 16 }}><Area label="Texto" name="news_copy" defaultValue={s.newsletter.copy} style={{ minHeight: 70 }} /></div>
        </fieldset>

        <fieldset className="fs">
          <legend>Pedidos y envíos</legend>
          <div className="grid2">
            <Text label="Mensaje inicial de WhatsApp" name="waMessage" defaultValue={s.checkout.whatsappMessage} />
            <Text label="Costo de envío" name="shippingCost" type="number" min="0" defaultValue={s.checkout.shippingCost} />
            <Text label="Envío gratis desde" name="freeShippingFrom" type="number" min="0" defaultValue={s.checkout.freeShippingFrom} hint="0 = nunca gratis" />
          </div>
        </fieldset>

        <fieldset className="fs">
          <legend>Aviso de edad y pie</legend>
          <Check label="Pedir confirmación de mayoría de edad al entrar" name="ageEnabled" defaultChecked={s.ageGate.enabled} />
          <div className="grid2" style={{ marginTop: 14 }}>
            <Text label="Título del aviso" name="ageTitle" defaultValue={s.ageGate.title} />
            <Text label="Texto del aviso" name="ageCopy" defaultValue={s.ageGate.copy} />
            <Text label="Copyright" name="copyright" defaultValue={s.footer.copyright} />
            <Text label="Medios de pago" name="payments" defaultValue={s.footer.payments.join(', ')} hint="separados por coma" />
          </div>
        </fieldset>

        <div className="bar"><Submit /></div>
      </ActionForm>
    </>
  );
}
