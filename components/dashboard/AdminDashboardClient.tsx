'use client';

import StatsCard from './StatsCard';
import {
  Users,
  MapPin,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  UserCheck,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStats {
  totalEmployees: number;
  totalSites: number;
  completedInstallations: number;
  pendingTasks: number;
  dailyVisits: number;
  monthlyReports: number;
  activeEmployees: number;
  sitesInProgress: number;
}

interface AdminDashboardClientProps {
  stats: DashboardStats;
  userName: string;
}

export default function AdminDashboardClient({ stats, userName }: AdminDashboardClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {userName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          color="blue"
          description="Active employees"
        />
        <StatsCard
          title="Total Sites"
          value={stats.totalSites}
          icon={MapPin}
          color="green"
          description="All registered sites"
        />
        <StatsCard
          title="Completed Installations"
          value={stats.completedInstallations}
          icon={CheckCircle}
          color="purple"
          description="Successfully completed"
        />
        <StatsCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={Clock}
          color="yellow"
          description="Awaiting completion"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Daily Visits"
          value={stats.dailyVisits}
          icon={FileText}
          color="indigo"
          description="Today's site visits"
        />
        <StatsCard
          title="Monthly Reports"
          value={stats.monthlyReports}
          icon={TrendingUp}
          color="green"
          description="This month"
        />
        <StatsCard
          title="Active Today"
          value={stats.activeEmployees}
          icon={UserCheck}
          color="blue"
          description="Employees checked in"
        />
        <StatsCard
          title="In Progress"
          value={stats.sitesInProgress}
          icon={Activity}
          color="yellow"
          description="Sites being worked on"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-accent rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New site visit completed</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-accent rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Task assigned to employee</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-accent rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New site registered</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/employees"
                className="p-4 bg-blue-500/10 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 rounded-lg transition-colors text-center"
              >
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Add Employee</p>
              </a>
              <a
                href="/admin/sites"
                className="p-4 bg-green-500/10 hover:bg-green-500/20 dark:hover:bg-green-500/30 rounded-lg transition-colors text-center"
              >
                <MapPin className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Add Site</p>
              </a>
              <a
                href="/admin/tasks"
                className="p-4 bg-purple-500/10 hover:bg-purple-500/20 dark:hover:bg-purple-500/30 rounded-lg transition-colors text-center"
              >
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Create Task</p>
              </a>
              <a
                href="/admin/reports"
                className="p-4 bg-yellow-500/10 hover:bg-yellow-500/20 dark:hover:bg-yellow-500/30 rounded-lg transition-colors text-center"
              >
                <FileText className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                <p className="text-sm font-medium">View Reports</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
