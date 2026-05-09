import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getSiteById } from '@/actions/site.actions';
import EmployeeSiteDetailClient from '@/components/employee/EmployeeSiteDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeSiteDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session || session.user.role !== 'employee') {
    redirect('/login');
  }

  const { id } = await params;
  const result = await getSiteById(id);

  if (!result.success || !result.data) {
    redirect('/employee/sites');
  }

  return (
    <DashboardLayout user={session.user}>
      <EmployeeSiteDetailClient site={result.data} />
    </DashboardLayout>
  );
}
