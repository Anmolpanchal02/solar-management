'use client';

import { useState } from 'react';
import { Search, Calendar, User, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/helpers';

interface Attendance {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  date: string;
  checkIn: string;
  checkOut?: string;
  status: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface AttendanceClientProps {
  attendance: Attendance[];
}

export default function AttendanceClient({ attendance }: AttendanceClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch = record.user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDate = !filterDate || record.date.startsWith(filterDate);
    return matchesSearch && matchesDate;
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground mt-1">Track employee attendance</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAttendance.map((record) => (
              <Card key={record._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold">{record.user.name}</h3>
                          <Badge variant={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Check-in: {new Date(record.checkIn).toLocaleTimeString()}
                          </span>
                          {record.checkOut && (
                            <span className="flex items-center gap-1">
                              Check-out: {new Date(record.checkOut).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredAttendance.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No attendance records found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
