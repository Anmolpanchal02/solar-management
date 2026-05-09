'use server';

import connectDB from '@/lib/db/mongodb';
import CalendarEvent from '@/models/CalendarEvent';
import { auth } from '@/lib/auth/auth';
import { revalidatePath } from 'next/cache';

export async function getCalendarEvents(startDate?: Date, endDate?: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const query: any = {};

    if (startDate && endDate) {
      query.start = { $gte: startDate, $lte: endDate };
    }

    // Filter by employee for non-admin users
    if (session.user.role === 'employee') {
      query.employee = session.user.id;
    }

    const events = await CalendarEvent.find(query)
      .populate('employee', 'name')
      .populate('site', 'customerName')
      .sort({ start: 1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(events)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEventsByDate(date: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      start: { $gte: startOfDay, $lte: endOfDay },
    };

    if (session.user.role === 'employee') {
      query.employee = session.user.id;
    }

    const events = await CalendarEvent.find(query)
      .populate('employee', 'name email')
      .populate('site', 'customerName address')
      .sort({ start: 1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(events)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCalendarEvent(data: {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
  employeeId?: string;
  siteId?: string;
}) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const eventData: any = {
      title: data.title,
      description: data.description,
      start: new Date(data.startDate),
      end: new Date(data.endDate),
      type: data.type,
    };

    if (data.employeeId) {
      eventData.employee = data.employeeId;
    }

    if (data.siteId) {
      eventData.site = data.siteId;
    }

    const event = await CalendarEvent.create(eventData);

    revalidatePath('/admin/calendar');
    revalidatePath('/employee/calendar');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(event)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCalendarEvent(
  id: string,
  data: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    employeeId?: string;
    siteId?: string;
  }
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate) updateData.start = new Date(data.startDate);
    if (data.endDate) updateData.end = new Date(data.endDate);
    if (data.type) updateData.type = data.type;
    if (data.employeeId) updateData.employee = data.employeeId;
    if (data.siteId) updateData.site = data.siteId;

    const event = await CalendarEvent.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      throw new Error('Event not found');
    }

    revalidatePath('/admin/calendar');
    revalidatePath('/employee/calendar');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(event)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const event = await CalendarEvent.findByIdAndDelete(id);

    if (!event) {
      throw new Error('Event not found');
    }

    revalidatePath('/admin/calendar');
    revalidatePath('/employee/calendar');

    return {
      success: true,
      message: 'Event deleted successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


// Get all activities (sites, tasks, visits) as calendar events
export async function getAllActivitiesAsEvents() {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const Site = (await import('@/models/Site')).default;
    const Task = (await import('@/models/Task')).default;
    const Visit = (await import('@/models/Visit')).default;

    // Get all sites
    const sites = await Site.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get all tasks
    const tasks = await Task.find()
      .populate('assignedTo', 'name')
      .populate('site', 'customerName')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get all visits
    const visits = await Visit.find()
      .populate('employee', 'name')
      .populate('site', 'customerName')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Convert to calendar events format
    const allEvents = [
      // Sites as events
      ...sites.map(site => ({
        _id: `site-${site._id}`,
        title: `Site: ${site.customerName}`,
        description: `Address: ${site.address}`,
        start: site.createdAt,
        end: site.createdAt,
        type: 'site',
        color: '#fbbf24', // yellow
        site: { _id: site._id, customerName: site.customerName }
      })),
      // Tasks as events
      ...tasks.map(task => ({
        _id: `task-${task._id}`,
        title: `Task: ${task.title}`,
        description: task.description || '',
        start: task.deadline || task.createdAt,
        end: task.deadline || task.createdAt,
        type: 'task',
        color: '#3b82f6', // blue
        employee: task.assignedTo ? { _id: task.assignedTo._id, name: task.assignedTo.name } : undefined,
        site: task.site ? { _id: task.site._id, customerName: task.site.customerName } : undefined
      })),
      // Visits as events
      ...visits.map(visit => ({
        _id: `visit-${visit._id}`,
        title: `Visit: ${visit.site?.customerName || 'Unknown Site'}`,
        description: visit.notes || '',
        start: visit.visitDate || visit.createdAt,
        end: visit.visitDate || visit.createdAt,
        type: 'visit',
        color: visit.status === 'completed' ? '#10b981' : '#8b5cf6', // green or purple
        employee: visit.employee ? { _id: visit.employee._id, name: visit.employee.name } : undefined,
        site: visit.site ? { _id: visit.site._id, customerName: visit.site.customerName } : undefined
      }))
    ];

    // Get regular calendar events
    const calendarEvents = await CalendarEvent.find()
      .populate('employee', 'name')
      .populate('site', 'customerName')
      .sort({ start: 1 })
      .lean();

    // Combine all events
    const combinedEvents = [
      ...calendarEvents.map(event => ({
        ...event,
        color: '#6366f1' // indigo for manual events
      })),
      ...allEvents
    ];

    return {
      success: true,
      data: JSON.parse(JSON.stringify(combinedEvents)),
    };
  } catch (error: any) {
    console.error('Get all activities error:', error);
    return { success: false, error: error.message };
  }
}
