import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getSites } from '@/actions/site.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SitesClient from '@/components/admin/SitesClient';

export const metadata: Metadata = {
  title: 'Sites | Solar Management',
  description: 'Manage solar installation sites',
};

export const revalidate = 30; // Revalidate every 30 seconds

export default async function SitesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const result = await getSites();
  const sites = result.success ? result.data : [];

  return (
    <DashboardLayout user={session.user}>
      <SitesClient sites={sites} />
    </DashboardLayout>
  );
}
