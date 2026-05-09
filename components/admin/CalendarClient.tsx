'use client';

import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { formatDate } from '@/utils/helpers';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/actions/calendar.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'visit',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      type: 'visit',
    });
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const result = await createCalendarEvent(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Event created successfully');
      setIsAddDialogOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to create event');
    }
  };

  const handleEdit = async () => {
    if (!selectedEvent || !formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const result = await updateCalendarEvent(selectedEvent._id, formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Event updated successfully');
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      resetForm();
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update event');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    setIsDeleting(true);
    const result = await deleteCalendarEvent(selectedEvent._id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Event deleted successfully');
      setIsViewDialogOpen(false);
      setSelectedEvent(null);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete event');
    }
  };

  const openEditDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: new Date(event.start).toISOString().split('T')[0],
      endDate: new Date(event.end).toISOString().split('T')[0],
      type: event.type,
    });
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(true);
  };

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
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">View and manage schedules</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
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
                    className={`p-2 min-h-[80px] border rounded-lg hover:bg-accent transition-colors cursor-pointer ${
                      isToday ? 'bg-primary/10 border-primary' : ''
                    }`}
                    onClick={() => {
                      const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                      setFormData({ ...formData, startDate: dateStr, endDate: dateStr });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <div className="font-semibold text-sm mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event._id}
                          className="text-xs p-1 bg-primary/20 rounded truncate"
                          onClick={(e) => {
                            e.stopPropagation();
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
                  {event.employee && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Employee: {event.employee.name}
                    </div>
                  )}
                  {event.site && (
                    <div className="mt-1 text-sm text-muted-foreground">
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

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Schedule a new event or meeting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Team Meeting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meeting agenda..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="visit">Visit</option>
                <option value="task">Task</option>
                <option value="attendance">Attendance</option>
                <option value="report">Report</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {selectedEvent.employee && (
                <div>
                  <Label>Employee</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.employee.name}
                  </p>
                </div>
              )}
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
            <Button variant="secondary" onClick={() => selectedEvent && openEditDialog(selectedEvent)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Event Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Team Meeting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meeting agenda..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Event Type *</Label>
              <select
                id="edit-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="visit">Visit</option>
                <option value="task">Task</option>
                <option value="attendance">Attendance</option>
                <option value="report">Report</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
