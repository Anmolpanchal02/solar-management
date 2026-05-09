import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';

export default async function Home() {
  const session = await auth();

  if (session) {
    if (session.user.role === 'admin') {
      redirect('/admin/dashboard');
    } else {
      redirect('/employee/dashboard');
    }
  } else {
    redirect('/login');
  }
}
