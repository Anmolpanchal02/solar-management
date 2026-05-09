'use server';

import { revalidatePath } from 'next/cache';
import { startOfDay, endOfDay } from 'date-fns';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import CalendarEvent from '@/models/CalendarEvent';
import { auth } from '@/lib/auth/auth';
import { checkInSchema, checkOutSchema } from '@/lib/validations/schemas';

export async function getAttendance() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();
    const attendance = await Attendance.find()
      .populate('employee', 'name email phone')
      .sort({ date: -1 })
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(attendance)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAttendanceByEmployee(employeeId: string) {
  try {
    await connectDB();
    const attendance = await Attendance.find({ employee: employeeId })
      .sort({ date: -1 })
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(attendance)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTodayAttendance(employeeId: string) {
  try {
    await connectDB();
    
    const today = new Date();
    const startDate = startOfDay(today);
    const endDate = endOfDay(today);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).lean();
    
    return {
      success: true,
      data: attendance ? JSON.parse(JSON.stringify(attendance)) : null,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkIn(data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'employee') {
      throw new Error('Unauthorized');
    }

    const validatedData = checkInSchema.parse(data);

    await connectDB();

    const today = new Date();
    const startDate = startOfDay(today);
    const endDate = endOfDay(today);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: session.user.id,
      date: { $gte: startDate, $lte: endDate },
    });

    if (existingAttendance) {
      throw new Error('Already checked in today');
    }

    const attendance = await Attendance.create({
      employee: session.user.id,
      date: today,
      checkIn: new Date(),
      location: {
        type: 'Point',
        coordinates: [validatedData.longitude, validatedData.latitude],
      },
      status: 'present',
    });

    // Create calendar event
    await CalendarEvent.create({
      title: `Check-in: ${session.user.name}`,
      description: 'Employee checked in',
      start: new Date(),
      end: new Date(),
      type: 'attendance',
      relatedTo: attendance._id.toString(),
      employee: session.user.id,
      color: '#10b981',
    });

    revalidatePath('/employee/dashboard');
    revalidatePath('/admin/attendance');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(attendance)),
      message: 'Checked in successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkOut(data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'employee') {
      throw new Error('Unauthorized');
    }

    const validatedData = checkOutSchema.parse(data);

    await connectDB();

    const attendance = await Attendance.findById(validatedData.attendanceId);

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    if (attendance.employee.toString() !== session.user.id) {
      throw new Error('Unauthorized');
    }

    if (attendance.checkOut) {
      throw new Error('Already checked out');
    }

    attendance.checkOut = new Date();
    
    // Calculate work hours
    const checkInTime = new Date(attendance.checkIn).getTime();
    const checkOutTime = new Date().getTime();
    const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    // Update status based on hours worked
    if (hoursWorked < 4) {
      attendance.status = 'half-day';
    }

    await attendance.save();

    revalidatePath('/employee/dashboard');
    revalidatePath('/admin/attendance');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(attendance)),
      message: 'Checked out successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAttendanceStats(employeeId?: string) {
  try {
    await connectDB();

    const query = employeeId ? { employee: employeeId } : {};
    
    const totalDays = await Attendance.countDocuments(query);
    const presentDays = await Attendance.countDocuments({ ...query, status: 'present' });
    const halfDays = await Attendance.countDocuments({ ...query, status: 'half-day' });
    
    const attendanceRate = totalDays > 0 ? ((presentDays + halfDays * 0.5) / totalDays) * 100 : 0;

    return {
      success: true,
      data: {
        totalDays,
        presentDays,
        halfDays,
        attendanceRate: Math.round(attendanceRate),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
