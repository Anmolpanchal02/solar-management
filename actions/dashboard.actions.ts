'use server';

import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Site from '@/models/Site';
import Task from '@/models/Task';
import Visit from '@/models/Visit';
import Attendance from '@/models/Attendance';
import { auth } from '@/lib/auth/auth';

export async function getAdminDashboardStats() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);
    const startMonth = startOfMonth(today);
    const endMonth = endOfMonth(today);

    // Get counts
    const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
    const totalSites = await Site.countDocuments();
    const completedInstallations = await Site.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: { $ne: 'completed' } });
    const sitesInProgress = await Site.countDocuments({ status: 'in-progress' });
    
    const dailyVisits = await Visit.countDocuments({
      visitDate: { $gte: startToday, $lte: endToday },
    });

    const monthlyReports = await Visit.countDocuments({
      visitDate: { $gte: startMonth, $lte: endMonth },
      status: 'completed',
    });

    const activeEmployees = await Attendance.distinct('employee', {
      date: { $gte: startToday, $lte: endToday },
    }).then((ids) => ids.length);

    return {
      success: true,
      data: {
        totalEmployees,
        totalSites,
        completedInstallations,
        pendingTasks,
        dailyVisits,
        monthlyReports,
        activeEmployees,
        sitesInProgress,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEmployeeDashboardStats(employeeId: string) {
  try {
    await connectDB();

    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);

    const assignedTasks = await Task.countDocuments({ assignedTo: employeeId });
    const completedTasks = await Task.countDocuments({ assignedTo: employeeId, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ assignedTo: employeeId, status: { $ne: 'completed' } });
    const assignedSites = await Site.countDocuments({ assignedEmployee: employeeId });
    
    const todayVisits = await Visit.countDocuments({
      employee: employeeId,
      visitDate: { $gte: startToday, $lte: endToday },
    });

    const todayAttendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startToday, $lte: endToday },
    });

    return {
      success: true,
      data: {
        assignedTasks,
        completedTasks,
        pendingTasks,
        assignedSites,
        todayVisits,
        checkedIn: !!todayAttendance,
        checkedOut: !!todayAttendance?.checkOut,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEmployeePerformance() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const employees = await User.find({ role: 'employee', isActive: true }).select('name').lean();

    const performanceData = await Promise.all(
      employees.map(async (employee) => {
        const completedTasks = await Task.countDocuments({
          assignedTo: employee._id as any,
          status: 'completed',
        });

        const pendingTasks = await Task.countDocuments({
          assignedTo: employee._id as any,
          status: { $ne: 'completed' },
        });

        const totalVisits = await Visit.countDocuments({ employee: employee._id as any });

        const attendanceStats = await Attendance.aggregate([
          { $match: { employee: employee._id } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              present: {
                $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
              },
            },
          },
        ]);

        const attendanceRate = attendanceStats.length > 0
          ? Math.round((attendanceStats[0].present / attendanceStats[0].total) * 100)
          : 0;

        return {
          employeeId: employee._id.toString(),
          employeeName: employee.name,
          completedTasks,
          pendingTasks,
          totalVisits,
          attendanceRate,
        };
      })
    );

    return {
      success: true,
      data: performanceData,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSiteStatusChart() {
  try {
    await connectDB();

    const statusCounts = await Site.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const chartData = statusCounts.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1).replace('-', ' '),
      value: item.count,
    }));

    return {
      success: true,
      data: chartData,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTaskPriorityChart() {
  try {
    await connectDB();

    const priorityCounts = await Task.aggregate([
      { $match: { status: { $ne: 'completed' } } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const chartData = priorityCounts.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
    }));

    return {
      success: true,
      data: chartData,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMonthlyVisitsChart() {
  try {
    await connectDB();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyVisits = await Visit.aggregate([
      { $match: { visitDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$visitDate' },
            month: { $month: '$visitDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const chartData = monthlyVisits.map((item) => ({
      name: `${item._id.month}/${item._id.year}`,
      visits: item.count,
    }));

    return {
      success: true,
      data: chartData,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
