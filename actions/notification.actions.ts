'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Notification from '@/models/Notification';
import { auth } from '@/lib/auth/auth';

export async function getNotifications() {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const notifications = await Notification.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(notifications)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnreadCount() {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const count = await Notification.countDocuments({
      user: session.user.id,
      isRead: false,
    });

    return {
      success: true,
      data: count,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAsRead(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    await Notification.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { $set: { isRead: true } }
    );

    revalidatePath('/admin/dashboard');
    revalidatePath('/employee/dashboard');

    return {
      success: true,
      message: 'Notification marked as read',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllAsRead() {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    await Notification.updateMany(
      { user: session.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    revalidatePath('/admin/dashboard');
    revalidatePath('/employee/dashboard');

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
