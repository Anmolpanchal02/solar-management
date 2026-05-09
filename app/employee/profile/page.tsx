import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getUserById } from '@/actions/user.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeeProfileClient from '@/components/employee/EmployeeProfileClient';

export const metadata: Metadata = {
  title: 'My Profile | Solar Management',
  description: 'View and update your profile',
};

export default async function EmployeeProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const result = await getUserById(session.user.id);

  if (!result.success || !result.data) {
    redirect('/login');
  }

  return (
    <DashboardLayout user={session.user}>
      <EmployeeProfileClient user={result.data} />
    </DashboardLayout>
  );
}
