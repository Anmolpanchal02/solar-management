import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getUsers } from '@/actions/user.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeesClient from '@/components/admin/EmployeesClient';

export const metadata: Metadata = {
  title: 'Employees | Solar Management',
  description: 'Manage employees and field workers',
};

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const result = await getUsers();
  const employees = result.success ? result.data : [];

  return (
    <DashboardLayout user={session.user}>
      <EmployeesClient employees={employees} />
    </DashboardLayout>
  );
}
