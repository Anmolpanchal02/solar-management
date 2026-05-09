import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getSiteById } from '@/actions/site.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SiteDetailClient from '@/components/admin/SiteDetailClient';

export const metadata: Metadata = {
  title: 'Site Details | Solar Management',
  description: 'View and manage site details',
};

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const { id } = await params;
  const result = await getSiteById(id);
  
  if (!result.success || !result.data) {
    redirect('/admin/sites');
  }

  return (
    <DashboardLayout user={session.user}>
      <SiteDetailClient site={result.data} />
    </DashboardLayout>
  );
}
