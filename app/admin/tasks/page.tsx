import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getTasks } from '@/actions/task.actions';
import { getUsers } from '@/actions/user.actions';
import { getSites } from '@/actions/site.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TasksClient from '@/components/admin/TasksClient';

export const metadata: Metadata = {
  title: 'Tasks | Solar Management',
  description: 'Manage tasks and assignments',
};

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const [tasksResult, usersResult, sitesResult] = await Promise.all([
    getTasks(),
    getUsers(),
    getSites(),
  ]);

  const tasks = tasksResult.success ? tasksResult.data : [];
  const allUsers = usersResult.success ? usersResult.data : [];
  const sites = sitesResult.success ? sitesResult.data : [];

  // Filter only employees
  const employees = allUsers.filter((user: any) => user.role === 'employee');

  return (
    <DashboardLayout user={session.user}>
      <TasksClient tasks={tasks} employees={employees} sites={sites} />
    </DashboardLayout>
  );
}
