import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getVisitsByEmployee } from '@/actions/visit.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeeVisitsClient from '@/components/employee/EmployeeVisitsClient';

export const metadata: Metadata = {
  title: 'My Visits | Solar Management',
  description: 'Track your site visits',
};

export default async function EmployeeVisitsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const result = await getVisitsByEmployee(session.user.id);
  const visits = result.success ? result.data : [];

  return (
    <DashboardLayout user={session.user}>
      <EmployeeVisitsClient visits={visits} userId={session.user.id} />
    </DashboardLayout>
  );
}
