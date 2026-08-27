import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req) {
  const { email } = await req.json().catch(() => ({}));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || '')))
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  await db.update('subscribers', (list) => {
    if (!list.some((s) => s.email === email.toLowerCase())) list.push({ email: email.toLowerCase(), at: new Date().toISOString() });
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
