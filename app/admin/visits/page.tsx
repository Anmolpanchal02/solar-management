import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getVisits } from '@/actions/visit.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import VisitsClient from '@/components/admin/VisitsClient';

export const metadata: Metadata = {
  title: 'Visits | Solar Management',
  description: 'Track site visits and inspections',
};

export default async function VisitsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const result = await getVisits();
  const visits = result.success ? result.data : [];

  return (
    <DashboardLayout user={session.user}>
      <VisitsClient visits={visits} />
    </DashboardLayout>
  );
}
