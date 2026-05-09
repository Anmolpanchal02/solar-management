import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getTasksByEmployee } from '@/actions/task.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeeTasksClient from '@/components/employee/EmployeeTasksClient';

export const metadata: Metadata = {
  title: 'My Tasks | Solar Management',
  description: 'View and manage your assigned tasks',
};

export const revalidate = 30; // Revalidate every 30 seconds

export default async function EmployeeTasksPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const result = await getTasksByEmployee(session.user.id);
  const tasks = result.success ? result.data : [];

  return (
    <DashboardLayout user={session.user}>
      <EmployeeTasksClient tasks={tasks} userId={session.user.id} />
    </DashboardLayout>
  );
}
