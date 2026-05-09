import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getCalendarEvents } from '@/actions/calendar.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CalendarClient from '@/components/admin/CalendarClient';

export const metadata: Metadata = {
  title: 'Calendar | Solar Management',
  description: 'View and manage schedules',
};

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const result = await getCalendarEvents();
  const events = result.success ? result.data : [];

  return (
    <DashboardLayout user={session.user}>
      <CalendarClient events={events} />
    </DashboardLayout>
  );
}
