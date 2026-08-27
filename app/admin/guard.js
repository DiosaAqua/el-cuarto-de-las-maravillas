import { redirect } from 'next/navigation';
import { getUser, can } from '@/lib/auth';

/** Uso en cada página del panel: const user = await guard('products'); */
export async function guard(perm) {
  const user = await getUser();
  if (!user) redirect('/admin/login');
  if (perm && !can(user, perm)) redirect('/admin?denied=' + perm);
  return user;
}
