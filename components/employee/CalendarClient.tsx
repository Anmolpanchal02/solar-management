'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/utils/helpers';

interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  type: string;
  employee?: { _id: string; name: string };
  site?: { _id: string; customerName: string };
}

interface CalendarClientProps {
  events: CalendarEvent[];
}

export default function CalendarClient({ events }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'visit':
        return 'default';
      case 'task':
        return 'secondary';
      case 'attendance':
        return 'outline';
      case 'report':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const upcomingEvents = events
    .filter((event) => new Date(event.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 10);

  // Calendar grid logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return events.filter(event => new Date(event.start).toDateString() === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Calendar</h1>
          <p className="text-muted-foreground mt-1">View your schedule</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{monthName}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm p-2 text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2 min-h-[80px]" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                
                return (
                  <div
                    key={day}
                    className={`p-2 min-h-[80px] border rounded-lg ${
                      isToday ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event._id}
                          className="text-xs p-1 bg-primary/20 rounded truncate cursor-pointer hover:bg-primary/30 transition-colors"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsViewDialogOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{event.title}</h4>
                    <Badge variant={getEventTypeColor(event.type)}>{event.type}</Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="w-3 h-3" />
                    <span>
                      {formatDate(event.start)}
                    </span>
                  </div>
                  {event.site && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Site: {event.site.customerName}
                    </div>
                  )}
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming events
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              <Badge variant={getEventTypeColor(selectedEvent?.type || '')}>
                {selectedEvent?.type}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              {selectedEvent.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              <div>
                <Label>Date & Time</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(selectedEvent.start)} - {formatDate(selectedEvent.end)}
                </p>
              </div>
              {selectedEvent.site && (
                <div>
                  <Label>Site</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.site.customerName}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
