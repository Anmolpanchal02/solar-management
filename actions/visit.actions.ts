'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Visit from '@/models/Visit';
import Site from '@/models/Site';
import CalendarEvent from '@/models/CalendarEvent';
import { auth } from '@/lib/auth/auth';
import { createVisitSchema, updateVisitSchema } from '@/lib/validations/schemas';

export async function getVisits() {
  try {
    await connectDB();
    const visits = await Visit.find()
      .select('employee site task visitDate checkOutTime status workCompletionPercentage createdAt')
      .populate('employee', 'name email phone')
      .populate('site', 'customerName address')
      .populate('task', 'title')
      .sort({ visitDate: -1 })
      .limit(100)
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(visits)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getVisitById(id: string) {
  try {
    await connectDB();
    const visit = await Visit.findById(id)
      .populate('employee', 'name email phone avatar')
      .populate('site', 'customerName address location')
      .populate('task', 'title description')
      .lean();
    
    if (!visit) {
      throw new Error('Visit not found');
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(visit)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getVisitsByEmployee(employeeId: string) {
  try {
    await connectDB();
    const visits = await Visit.find({ employee: employeeId })
      .select('site task visitDate checkOutTime status workCompletionPercentage notes createdAt')
      .populate('site', 'customerName address')
      .populate('task', 'title')
      .sort({ visitDate: -1 })
      .limit(50)
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(visits)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createVisit(data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'employee') {
      throw new Error('Unauthorized');
    }

    const validatedData = createVisitSchema.parse(data);

    await connectDB();

    const visit = await Visit.create({
      employee: session.user.id,
      site: validatedData.site,
      task: validatedData.task,
      location: {
        type: 'Point',
        coordinates: [validatedData.longitude, validatedData.latitude],
      },
      notes: validatedData.notes || '',
      beforeImages: validatedData.beforeImages || [],
    });

    // Create calendar event
    const site = await Site.findById(validatedData.site);
    await CalendarEvent.create({
      title: `Visit: ${site?.customerName}`,
      description: validatedData.notes || 'Site visit',
      start: new Date(),
      end: new Date(),
      type: 'visit',
      relatedTo: visit._id.toString(),
      employee: session.user.id,
      site: validatedData.site,
      color: '#10b981',
    });

    revalidatePath('/employee/visits');
    revalidatePath('/admin/visits');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(visit)),
      message: 'Visit started successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateVisit(id: string, data: any) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const validatedData = updateVisitSchema.parse(data);

    await connectDB();

    const updateData: any = { ...validatedData };

    if (validatedData.checkOutTime) {
      updateData.checkOutTime = new Date(validatedData.checkOutTime);
    }

    const visit = await Visit.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('site');

    if (!visit) {
      throw new Error('Visit not found');
    }

    // Update site progress if provided
    if (validatedData.workCompletionPercentage !== undefined) {
      const siteId = typeof visit.site === 'string' ? visit.site : visit.site._id;
      await Site.findByIdAndUpdate(
        siteId,
        {
          $set: { progressPercentage: validatedData.workCompletionPercentage },
          $push: {
            timeline: {
              action: 'Progress Updated',
              description: `Work progress updated to ${validatedData.workCompletionPercentage}%`,
              performedBy: session.user.name,
              timestamp: new Date(),
            },
          },
        }
      );
    }

    revalidatePath('/employee/visits');
    revalidatePath('/admin/visits');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(visit)),
      message: 'Visit updated successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeVisit(id: string, data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'employee') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    // First, get the existing visit
    const existingVisit = await Visit.findById(id);
    if (!existingVisit) {
      throw new Error('Visit not found');
    }

    const visit = await Visit.findByIdAndUpdate(
      id,
      {
        $set: {
          checkOutTime: new Date(),
          afterImages: data.afterImages || [],
          notes: data.notes || existingVisit.notes,
          workCompletionPercentage: data.workCompletionPercentage || 0,
          status: 'completed',
        },
      },
      { new: true }
    ).populate('site');

    if (!visit) {
      throw new Error('Visit not found');
    }

    // Update site progress
    if (data.workCompletionPercentage !== undefined) {
      const siteId = typeof visit.site === 'string' ? visit.site : visit.site._id;
      await Site.findByIdAndUpdate(
        siteId,
        {
          $set: { progressPercentage: data.workCompletionPercentage },
          $push: {
            timeline: {
              action: 'Visit Completed',
              description: `Site visit completed with ${data.workCompletionPercentage}% progress`,
              performedBy: session.user.name,
              timestamp: new Date(),
            },
          },
        }
      );
    }

    revalidatePath('/employee/visits');
    revalidatePath('/admin/visits');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(visit)),
      message: 'Visit completed successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteVisit(id: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const visit = await Visit.findByIdAndDelete(id);

    if (!visit) {
      throw new Error('Visit not found');
    }

    // Delete related calendar events
    await CalendarEvent.deleteMany({ relatedTo: id });

    revalidatePath('/admin/visits');
    revalidatePath('/employee/visits');
    
    return {
      success: true,
      message: 'Visit deleted successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
