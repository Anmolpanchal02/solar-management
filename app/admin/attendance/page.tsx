import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getAttendance } from '@/actions/attendance.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AttendanceClient from '@/components/admin/AttendanceClient';

export const metadata: Metadata = {
  title: 'Attendance | Solar Management',
  description: 'Track employee attendance',
};

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const result = await getAttendance();
  const attendance = result.success ? result.data : [];

  return (
    <DashboardLayout user={session.user}>
      <AttendanceClient attendance={attendance} />
    </DashboardLayout>
  );
}
