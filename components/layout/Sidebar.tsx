'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  MapPin,
  CheckSquare,
  FileText,
  Calendar,
  Clock,
  BarChart3,
  Sun,
  UserCircle,
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'employee';
}

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/sites', label: 'Sites', icon: MapPin },
  { href: '/admin/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/admin/visits', label: 'Visits', icon: FileText },
  { href: '/admin/attendance', label: 'Attendance', icon: Clock },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

const employeeLinks = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/tasks', label: 'My Tasks', icon: CheckSquare },
  { href: '/employee/sites', label: 'My Sites', icon: MapPin },
  { href: '/employee/visits', label: 'Visits', icon: FileText },
  { href: '/employee/attendance', label: 'Attendance', icon: Clock },
  { href: '/employee/calendar', label: 'Calendar', icon: Calendar },
  { href: '/employee/profile', label: 'Profile', icon: UserCircle },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === 'admin' ? adminLinks : employeeLinks;

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-900 dark:bg-gray-950 text-white border-r border-gray-800 dark:border-gray-900">
      <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-800 dark:border-gray-900">
        <Sun className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-lg font-bold">Solar Manager</h1>
          <p className="text-xs text-gray-400 capitalize">{role} Panel</p>
        </div>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-900',
                    isActive && 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
