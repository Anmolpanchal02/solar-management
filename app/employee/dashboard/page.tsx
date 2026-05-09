import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCardWrapper from '@/components/dashboard/StatsCardWrapper';
import { getEmployeeDashboardStats } from '@/actions/dashboard.actions';
import { getTodayAttendance } from '@/actions/attendance.actions';
import { CheckSquare, MapPin, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const revalidate = 30; // Revalidate every 30 seconds

export default async function EmployeeDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== 'employee') {
    redirect('/login');
  }

  const statsResult = await getEmployeeDashboardStats(session.user.id);
  const attendanceResult = await getTodayAttendance(session.user.id);
  
  const stats = statsResult.success ? statsResult.data : null;
  const attendance = attendanceResult.success ? attendanceResult.data : null;

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {session.user.name}</p>
        </div>

        {/* Attendance Status */}
        <Card className={attendance ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {attendance ? 'You are checked in' : 'You haven\'t checked in today'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {attendance
                    ? `Checked in at ${new Date(attendance.checkIn).toLocaleTimeString()}`
                    : 'Please check in to start your day'}
                </p>
              </div>
              <Link href="/employee/attendance">
                <Button>
                  {attendance && !attendance.checkOut ? 'Check Out' : 'Check In'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCardWrapper
                title="Assigned Tasks"
                value={stats.assignedTasks}
                iconName="CheckSquare"
                color="blue"
                description="Total tasks assigned"
              />
              <StatsCardWrapper
                title="Completed Tasks"
                value={stats.completedTasks}
                iconName="CheckCircle"
                color="green"
                description="Successfully completed"
              />
              <StatsCardWrapper
                title="Pending Tasks"
                value={stats.pendingTasks}
                iconName="AlertCircle"
                color="yellow"
                description="Awaiting completion"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCardWrapper
                title="Assigned Sites"
                value={stats.assignedSites}
                iconName="MapPin"
                color="purple"
                description="Sites under your care"
              />
              <StatsCardWrapper
                title="Today's Visits"
                value={stats.todayVisits}
                iconName="FileText"
                color="indigo"
                description="Site visits today"
              />
              <StatsCardWrapper
                title="Attendance"
                value={attendance ? 'Present' : 'Absent'}
                iconName="Clock"
                color={attendance ? 'green' : 'red'}
                description="Today's status"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/employee/tasks"
                      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                    >
                      <CheckSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">View Tasks</p>
                    </Link>
                    <Link
                      href="/employee/sites"
                      className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
                    >
                      <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">My Sites</p>
                    </Link>
                    <Link
                      href="/employee/visits"
                      className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
                    >
                      <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Submit Visit</p>
                    </Link>
                    <Link
                      href="/employee/attendance"
                      className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center"
                    >
                      <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Attendance</p>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-1 h-full bg-blue-500 rounded"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Morning Site Visit</p>
                        <p className="text-xs text-gray-500">9:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-1 h-full bg-green-500 rounded"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Installation Task</p>
                        <p className="text-xs text-gray-500">2:00 PM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
