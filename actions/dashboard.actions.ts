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

    // Run all queries in parallel for better performance
    const [
      totalEmployees,
      totalSites,
      completedInstallations,
      pendingTasks,
      sitesInProgress,
      dailyVisits,
      monthlyReports,
      activeEmployeeIds
    ] = await Promise.all([
      User.countDocuments({ role: 'employee', isActive: true }),
      Site.countDocuments(),
      Site.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: { $ne: 'completed' } }),
      Site.countDocuments({ status: 'in-progress' }),
      Visit.countDocuments({
        visitDate: { $gte: startToday, $lte: endToday },
      }),
      Visit.countDocuments({
        visitDate: { $gte: startMonth, $lte: endMonth },
        status: 'completed',
      }),
      Attendance.distinct('employee', {
        date: { $gte: startToday, $lte: endToday },
      })
    ]);

    const activeEmployees = activeEmployeeIds.length;

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

    // Run all queries in parallel
    const [
      assignedTasks,
      completedTasks,
      pendingTasks,
      assignedSites,
      todayVisits,
      todayAttendance
    ] = await Promise.all([
      Task.countDocuments({ assignedTo: employeeId }),
      Task.countDocuments({ assignedTo: employeeId, status: 'completed' }),
      Task.countDocuments({ assignedTo: employeeId, status: { $ne: 'completed' } }),
      Site.countDocuments({ assignedEmployee: employeeId }),
      Visit.countDocuments({
        employee: employeeId,
        visitDate: { $gte: startToday, $lte: endToday },
      }),
      Attendance.findOne({
        employee: employeeId,
        date: { $gte: startToday, $lte: endToday },
      }).select('checkOut').lean()
    ]);

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


export async function getRecentActivity() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    // Run all queries in parallel for better performance
    const [recentSites, recentTasks, recentVisits] = await Promise.all([
      Site.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('customerName createdAt')
        .lean(),
      Task.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedTo', 'name')
        .select('title assignedTo createdAt')
        .lean(),
      Visit.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('employee', 'name')
        .populate('site', 'customerName')
        .select('employee site status createdAt')
        .lean()
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentSites.map(site => ({
        type: 'site',
        message: `New site registered: ${site.customerName}`,
        timestamp: site.createdAt,
        color: 'yellow'
      })),
      ...recentTasks.map(task => ({
        type: 'task',
        message: `Task assigned: ${task.title}${task.assignedTo && typeof task.assignedTo === 'object' ? ` to ${task.assignedTo.name}` : ''}`,
        timestamp: task.createdAt,
        color: 'blue'
      })),
      ...recentVisits.map(visit => ({
        type: 'visit',
        message: `Site visit ${visit.status}: ${visit.site && typeof visit.site === 'object' ? visit.site.customerName : 'Unknown'} by ${visit.employee && typeof visit.employee === 'object' ? visit.employee.name : 'Unknown'}`,
        timestamp: visit.createdAt,
        color: visit.status === 'completed' ? 'green' : 'purple'
      }))
    ];

    // Sort by timestamp and take latest 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestActivities = activities.slice(0, 10);

    return {
      success: true,
      data: latestActivities,
    };
  } catch (error: any) {
    console.error('Get recent activity error:', error);
    return { success: false, error: error.message };
  }
}
