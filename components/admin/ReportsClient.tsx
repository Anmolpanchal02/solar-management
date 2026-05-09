'use client';

import { useState } from 'react';
import { Download, FileText, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ReportsClient() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportTypes = [
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Employee attendance summary and statistics',
      icon: FileText,
    },
    {
      id: 'tasks',
      title: 'Task Completion Report',
      description: 'Task status and completion rates',
      icon: BarChart3,
    },
    {
      id: 'sites',
      title: 'Site Progress Report',
      description: 'Installation progress across all sites',
      icon: PieChart,
    },
    {
      id: 'performance',
      title: 'Performance Report',
      description: 'Employee and team performance metrics',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and download reports</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{report.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm">
                        <Download className="w-3 h-3 mr-2" />
                        Download PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-2" />
                        Download Excel
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Name</label>
              <Input placeholder="Enter custom report name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Select Metrics</label>
              <div className="grid grid-cols-2 gap-2">
                {['Attendance', 'Tasks', 'Sites', 'Visits', 'Performance', 'Revenue'].map(
                  (metric) => (
                    <label key={metric} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{metric}</span>
                    </label>
                  )
                )}
              </div>
            </div>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Generate Custom Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
