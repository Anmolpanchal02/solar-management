import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getSites } from '@/actions/site.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeeSitesClient from '@/components/employee/EmployeeSitesClient';

export const metadata: Metadata = {
  title: 'Sites | Solar Management',
  description: 'View assigned sites',
};

export default async function EmployeeSitesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const result = await getSites();
  const sites = result.success ? result.data : [];

  return (
    <DashboardLayout user={session.user}>
      <EmployeeSitesClient sites={sites} />
    </DashboardLayout>
  );
}
