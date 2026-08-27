import { notFound } from 'next/navigation';
import { getSite } from '@/lib/shop';

export async function generateMetadata({ params }) {
  const page = (await getSite()).pages.find((p) => p.slug === params.slug && p.published);
  return page ? { title: page.title } : {};
}

export default async function Pagina({ params }) {
  const page = (await getSite()).pages.find((p) => p.slug === params.slug && p.published);
  if (!page) notFound();
  return (
    <section className="blk wrap" style={{ maxWidth: 720 }}>
      <h1 className="display" style={{ fontSize: 'clamp(30px,4vw,44px)', margin: '0 0 20px' }}>{page.title}</h1>
      <div style={{ fontSize: 15.5, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: page.body }} />
    </section>
  );
}
