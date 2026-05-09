import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminDashboardClient from '@/components/dashboard/AdminDashboardClient';
import { getAdminDashboardStats } from '@/actions/dashboard.actions';

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const statsResult = await getAdminDashboardStats();
  const stats = statsResult.success && statsResult.data ? statsResult.data : {
    totalEmployees: 0,
    totalSites: 0,
    completedInstallations: 0,
    pendingTasks: 0,
    dailyVisits: 0,
    monthlyReports: 0,
    activeEmployees: 0,
    sitesInProgress: 0,
  };

  return (
    <DashboardLayout user={session.user}>
      <AdminDashboardClient stats={stats} userName={session.user.name} />
    </DashboardLayout>
  );
}
