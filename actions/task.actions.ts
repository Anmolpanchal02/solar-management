'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Task from '@/models/Task';
import CalendarEvent from '@/models/CalendarEvent';
import Notification from '@/models/Notification';
import { auth } from '@/lib/auth/auth';
import { createTaskSchema, updateTaskSchema } from '@/lib/validations/schemas';

export async function getTasks() {
  try {
    await connectDB();
    const tasks = await Task.find()
      .populate('site', 'customerName address')
      .populate('assignedTo', 'name email phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(tasks)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTaskById(id: string) {
  try {
    await connectDB();
    const task = await Task.findById(id)
      .populate('site', 'customerName address location')
      .populate('assignedTo', 'name email phone avatar')
      .populate('createdBy', 'name')
      .lean();
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(task)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTasksByEmployee(employeeId: string) {
  try {
    await connectDB();
    const tasks = await Task.find({ assignedTo: employeeId })
      .populate('site', 'customerName address location')
      .sort({ deadline: 1 })
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(tasks)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTask(data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const validatedData = createTaskSchema.parse(data);

    await connectDB();

    const task = await Task.create({
      ...validatedData,
      createdBy: session.user.id,
    });

    // Create calendar event
    await CalendarEvent.create({
      title: validatedData.title,
      description: validatedData.description,
      start: new Date(validatedData.deadline),
      end: new Date(validatedData.deadline),
      type: 'task',
      relatedTo: task._id.toString(),
      employee: validatedData.assignedTo,
      site: validatedData.site,
      color: validatedData.priority === 'high' ? '#ef4444' : validatedData.priority === 'medium' ? '#f59e0b' : '#3b82f6',
    });

    // Create notification
    await Notification.create({
      user: validatedData.assignedTo,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${validatedData.title}`,
      type: 'task',
      relatedTo: task._id.toString(),
    });

    revalidatePath('/admin/tasks');
    revalidatePath('/employee/tasks');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(task)),
      message: 'Task created successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTask(id: string, data: any) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const validatedData = updateTaskSchema.parse(data);

    await connectDB();

    const updateData: any = { ...validatedData };

    if (validatedData.status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('site', 'customerName')
      .populate('assignedTo', 'name');

    if (!task) {
      throw new Error('Task not found');
    }

    // Update calendar event
    if (validatedData.deadline) {
      await CalendarEvent.findOneAndUpdate(
        { relatedTo: id, type: 'task' },
        {
          $set: {
            start: new Date(validatedData.deadline),
            end: new Date(validatedData.deadline),
          },
        }
      );
    }

    // Create notification if status changed to completed
    if (validatedData.status === 'completed') {
      await Notification.create({
        user: task.createdBy,
        title: 'Task Completed',
        message: `Task "${task.title}" has been completed`,
        type: 'task',
        relatedTo: task._id.toString(),
      });
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/employee/tasks');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(task)),
      message: 'Task updated successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTask(id: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      throw new Error('Task not found');
    }

    // Delete related calendar events
    await CalendarEvent.deleteMany({ relatedTo: id, type: 'task' });

    revalidatePath('/admin/tasks');
    revalidatePath('/employee/tasks');
    
    return {
      success: true,
      message: 'Task deleted successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
