import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReportsClient from '@/components/admin/ReportsClient';

export const metadata: Metadata = {
  title: 'Reports | Solar Management',
  description: 'Generate and view reports',
};

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <DashboardLayout user={session.user}>
      <ReportsClient />
    </DashboardLayout>
  );
}
