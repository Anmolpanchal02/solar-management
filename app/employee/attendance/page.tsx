import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { getAttendanceByEmployee } from '@/actions/attendance.actions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeeAttendanceClient from '@/components/employee/EmployeeAttendanceClient';

export const metadata: Metadata = {
  title: 'My Attendance | Solar Management',
  description: 'Track your attendance',
};

export default async function EmployeeAttendancePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const result = await getAttendanceByEmployee(session.user.id);
  const attendance = result.success ? result.data : [];

  return (
    <DashboardLayout user={session.user}>
      <EmployeeAttendanceClient attendance={attendance} userId={session.user.id} />
    </DashboardLayout>
  );
}
