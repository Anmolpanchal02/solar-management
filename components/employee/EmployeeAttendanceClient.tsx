'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/helpers';

interface Attendance {
  _id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface EmployeeAttendanceClientProps {
  attendance: Attendance[];
  userId: string;
}

export default function EmployeeAttendanceClient({
  attendance,
  userId,
}: EmployeeAttendanceClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const todayAttendance = attendance.find(
    (record) =>
      new Date(record.date).toDateString() === new Date().toDateString()
  );

  const monthlyAttendance = attendance.filter((record) => {
    const date = new Date(record.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const presentDays = monthlyAttendance.filter((r) => r.status === 'present').length;
  const absentDays = monthlyAttendance.filter((r) => r.status === 'absent').length;
  const lateDays = monthlyAttendance.filter((r) => r.status === 'late').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'default';
      case 'absent':
        return 'destructive';
      case 'late':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground mt-1">Track your attendance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAttendance ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={getStatusColor(todayAttendance.status)}>
                    {todayAttendance.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-in</span>
                  <span className="font-medium">
                    {new Date(todayAttendance.checkIn).toLocaleTimeString()}
                  </span>
                </div>
                {todayAttendance.checkOut && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Check-out</span>
                    <span className="font-medium">
                      {new Date(todayAttendance.checkOut).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {!todayAttendance.checkOut && (
                  <Button className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't checked in today</p>
                <Button>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <span className="text-sm font-medium">Present Days</span>
                <span className="text-2xl font-bold text-green-600">{presentDays}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                <span className="text-sm font-medium">Absent Days</span>
                <span className="text-2xl font-bold text-red-600">{absentDays}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                <span className="text-sm font-medium">Late Days</span>
                <span className="text-2xl font-bold text-yellow-600">{lateDays}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {monthlyAttendance.map((record) => (
              <div
                key={record._id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formatDate(record.date)}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        In: {new Date(record.checkIn).toLocaleTimeString()}
                      </span>
                      {record.checkOut && (
                        <span>
                          Out: {new Date(record.checkOut).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusColor(record.status)}>{record.status}</Badge>
              </div>
            ))}
            {monthlyAttendance.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No attendance records for this month
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
