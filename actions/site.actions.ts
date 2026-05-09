'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Site from '@/models/Site';
import CalendarEvent from '@/models/CalendarEvent';
import { auth } from '@/lib/auth/auth';
import { createSiteSchema, updateSiteSchema } from '@/lib/validations/schemas';

export async function getSites() {
  try {
    await connectDB();
    const sites = await Site.find()
      .select('customerName customerPhone address status progressPercentage assignedEmployee createdAt')
      .populate('assignedEmployee', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(sites)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSiteById(id: string) {
  try {
    await connectDB();
    const site = await Site.findById(id)
      .populate('assignedEmployee', 'name email phone avatar')
      .lean();
    
    if (!site) {
      throw new Error('Site not found');
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(site)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSitesByEmployee(employeeId: string) {
  try {
    await connectDB();
    const sites = await Site.find({ assignedEmployee: employeeId })
      .select('customerName customerPhone address status progressPercentage location createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(sites)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSite(data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const validatedData = createSiteSchema.parse(data);

    await connectDB();

    const siteData: any = {
      customerName: validatedData.customerName,
      customerPhone: validatedData.customerPhone,
      address: validatedData.address,
      installationType: validatedData.installationType || '',
      location: {
        type: 'Point',
        coordinates: validatedData.latitude && validatedData.longitude 
          ? [validatedData.longitude, validatedData.latitude]
          : [0, 0],
      },
      timeline: [
        {
          action: 'Site Created',
          description: 'Site was created in the system',
          performedBy: session.user.name,
          timestamp: new Date(),
        },
      ],
    };

    if (validatedData.assignedEmployee) {
      siteData.assignedEmployee = validatedData.assignedEmployee;
    }

    const site = await Site.create(siteData);

    revalidatePath('/admin/sites');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(site)),
      message: 'Site created successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSite(id: string, data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const validatedData = updateSiteSchema.parse(data);

    await connectDB();

    const updateData: any = { ...validatedData };
    
    if (validatedData.latitude && validatedData.longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [validatedData.longitude, validatedData.latitude],
      };
      delete updateData.latitude;
      delete updateData.longitude;
    }

    // Add timeline entry
    const timelineEntry = {
      action: 'Site Updated',
      description: 'Site information was updated',
      performedBy: session.user.name,
      timestamp: new Date(),
    };

    const site = await Site.findByIdAndUpdate(
      id,
      {
        $set: updateData,
        $push: { timeline: timelineEntry },
      },
      { new: true, runValidators: true }
    ).populate('assignedEmployee', 'name email phone');

    if (!site) {
      throw new Error('Site not found');
    }

    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${id}`);
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(site)),
      message: 'Site updated successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSite(id: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const site = await Site.findByIdAndDelete(id);

    if (!site) {
      throw new Error('Site not found');
    }

    // Delete related calendar events
    await CalendarEvent.deleteMany({ site: id });

    revalidatePath('/admin/sites');
    
    return {
      success: true,
      message: 'Site deleted successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSiteProgress(id: string, progressPercentage: number) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    let status = 'pending';
    if (progressPercentage > 0 && progressPercentage < 100) {
      status = 'in-progress';
    } else if (progressPercentage === 100) {
      status = 'completed';
    }

    const timelineEntry = {
      action: 'Progress Updated',
      description: `Progress updated to ${progressPercentage}%`,
      performedBy: session.user.name,
      timestamp: new Date(),
    };

    const site = await Site.findByIdAndUpdate(
      id,
      {
        $set: { progressPercentage, status },
        $push: { timeline: timelineEntry },
      },
      { new: true }
    );

    if (!site) {
      throw new Error('Site not found');
    }

    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${id}`);
    revalidatePath('/employee/sites');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(site)),
      message: 'Site progress updated successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStep1Documents(
  siteId: string, 
  documents: { 
    billImage?: string; 
    aadharImage?: string; 
    cancelledChequeImage?: string;
  }
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const updateData: any = {};
    const uploadedDocs: string[] = [];
    const deletedDocs: string[] = [];

    // Handle billImage (including deletion)
    if (documents.billImage !== undefined) {
      updateData['step1Documents.billImage'] = documents.billImage;
      if (documents.billImage) {
        uploadedDocs.push('Bill');
      } else {
        deletedDocs.push('Bill');
      }
    }
    
    // Handle aadharImage (including deletion)
    if (documents.aadharImage !== undefined) {
      updateData['step1Documents.aadharImage'] = documents.aadharImage;
      if (documents.aadharImage) {
        uploadedDocs.push('Aadhar Card');
      } else {
        deletedDocs.push('Aadhar Card');
      }
    }
    
    // Handle cancelledChequeImage (including deletion)
    if (documents.cancelledChequeImage !== undefined) {
      updateData['step1Documents.cancelledChequeImage'] = documents.cancelledChequeImage;
      if (documents.cancelledChequeImage) {
        uploadedDocs.push('Cancelled Cheque');
      } else {
        deletedDocs.push('Cancelled Cheque');
      }
    }

    updateData['step1Documents.uploadedBy'] = session.user.name;
    updateData['step1Documents.uploadedAt'] = new Date();

    // Create description based on action
    let description = '';
    if (uploadedDocs.length > 0 && deletedDocs.length > 0) {
      description = `Updated: ${uploadedDocs.join(', ')}; Deleted: ${deletedDocs.join(', ')}`;
    } else if (uploadedDocs.length > 0) {
      description = `Updated documents: ${uploadedDocs.join(', ')}`;
    } else if (deletedDocs.length > 0) {
      description = `Deleted documents: ${deletedDocs.join(', ')}`;
    } else {
      description = 'Documents updated';
    }

    const site = await Site.findByIdAndUpdate(
      siteId,
      {
        $set: updateData,
        $push: {
          timeline: {
            action: 'Step 1 Documents Updated',
            description: description,
            performedBy: session.user.name,
            timestamp: new Date(),
          }
        },
      },
      { new: true }
    );

    if (!site) {
      throw new Error('Site not found');
    }

    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(site)),
      message: deletedDocs.length > 0 ? 'Document deleted successfully' : 'Documents updated successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStep2Data(
  siteId: string,
  kilowatt: number
) {
  try {
    console.log('updateStep2Data called with:', { siteId, kilowatt });
    
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    console.log('Session user:', session.user.name);

    await connectDB();

    const site = await Site.findByIdAndUpdate(
      siteId,
      {
        $set: {
          'step2Data.kilowatt': kilowatt,
          'step2Data.updatedBy': session.user.name,
          'step2Data.updatedAt': new Date(),
        },
        $push: {
          timeline: {
            action: 'Step 2 Data Updated',
            description: `Set kilowatt to ${kilowatt} KW`,
            performedBy: session.user.name,
            timestamp: new Date(),
          }
        },
      },
      { new: true }
    );

    if (!site) {
      throw new Error('Site not found');
    }

    console.log('Site updated successfully:', site._id);

    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(site)),
      message: 'Kilowatt updated successfully',
    };
  } catch (error: any) {
    console.error('updateStep2Data error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateStep3Data(
  siteId: string,
  structure: Array<{ size: string; numberOfPipes: number }>
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const site = await Site.findByIdAndUpdate(
      siteId,
      {
        $set: {
          'step3Data.structure': structure,
          'step3Data.updatedBy': session.user.name,
          'step3Data.updatedAt': new Date(),
        },
        $push: {
          timeline: {
            action: 'Step 3 Data Updated',
            description: `Updated material requirements: ${structure.length} structure items`,
            performedBy: session.user.name,
            timestamp: new Date(),
          }
        },
      },
      { new: true }
    );

    if (!site) {
      throw new Error('Site not found');
    }

    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(site)),
      message: 'Material requirements updated successfully',
    };
  } catch (error: any) {
    console.error('updateStep3Data error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateStep4Data(
  siteId: string,
  data: {
    moduleWatt: number;
    moduleQuantity: number;
    dcWireLength: number;
    acWireLength: number;
  }
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const site = await Site.findByIdAndUpdate(
      siteId,
      {
        $set: {
          'step4Data.moduleWatt': data.moduleWatt,
          'step4Data.moduleQuantity': data.moduleQuantity,
          'step4Data.dcWireLength': data.dcWireLength,
          'step4Data.acWireLength': data.acWireLength,
          'step4Data.updatedBy': session.user.name,
          'step4Data.updatedAt': new Date(),
        },
        $push: {
          timeline: {
            action: 'Step 4 Data Updated',
            description: `Panel & Wire: ${data.moduleWatt}W × ${data.moduleQuantity} modules, DC: ${data.dcWireLength}m, AC: ${data.acWireLength}m`,
            performedBy: session.user.name,
            timestamp: new Date(),
          }
        },
      },
      { new: true }
    );

    if (!site) {
      throw new Error('Site not found');
    }

    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(site)),
      message: 'Panel & Wire data updated successfully',
    };
  } catch (error: any) {
    console.error('updateStep4Data error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateStep5Data(siteId: string, data: any) {
  try {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');
    await connectDB();
    const site = await Site.findByIdAndUpdate(siteId, {
      $set: { ...Object.keys(data).reduce((acc, key) => ({ ...acc, [`step5Data.${key}`]: data[key] }), {}), 'step5Data.updatedBy': session.user.name, 'step5Data.updatedAt': new Date() },
      $push: { timeline: { action: 'Step 5 Updated', description: 'DCDB & ACDB data updated', performedBy: session.user.name, timestamp: new Date() } }
    }, { new: true });
    if (!site) throw new Error('Site not found');
    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);
    return { success: true, data: JSON.parse(JSON.stringify(site)), message: 'Step 5 updated successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStep6Data(siteId: string, data: any) {
  try {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');
    await connectDB();
    const site = await Site.findByIdAndUpdate(siteId, {
      $set: { ...Object.keys(data).reduce((acc, key) => ({ ...acc, [`step6Data.${key}`]: data[key] }), {}), 'step6Data.updatedBy': session.user.name, 'step6Data.updatedAt': new Date() },
      $push: { timeline: { action: 'Step 6 Updated', description: 'Earthing & Lightning data updated', performedBy: session.user.name, timestamp: new Date() } }
    }, { new: true });
    if (!site) throw new Error('Site not found');
    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);
    return { success: true, data: JSON.parse(JSON.stringify(site)), message: 'Step 6 updated successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStep7Data(siteId: string, data: any) {
  try {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');
    await connectDB();
    const site = await Site.findByIdAndUpdate(siteId, {
      $set: { ...Object.keys(data).reduce((acc, key) => ({ ...acc, [`step7Data.${key}`]: data[key] }), {}), 'step7Data.updatedBy': session.user.name, 'step7Data.updatedAt': new Date() },
      $push: { timeline: { action: 'Step 7 Updated', description: 'Inverter & Net Meter data updated', performedBy: session.user.name, timestamp: new Date() } }
    }, { new: true });
    if (!site) throw new Error('Site not found');
    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);
    return { success: true, data: JSON.parse(JSON.stringify(site)), message: 'Step 7 updated successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStep8Data(siteId: string, data: any) {
  try {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');
    await connectDB();
    const site = await Site.findByIdAndUpdate(siteId, {
      $set: { ...Object.keys(data).reduce((acc, key) => ({ ...acc, [`step8Data.${key}`]: data[key] }), {}), 'step8Data.updatedBy': session.user.name, 'step8Data.updatedAt': new Date() },
      $push: { timeline: { action: 'Step 8 Updated', description: 'Monitoring & Dates updated', performedBy: session.user.name, timestamp: new Date() } }
    }, { new: true });
    if (!site) throw new Error('Site not found');
    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);
    return { success: true, data: JSON.parse(JSON.stringify(site)), message: 'Step 8 updated successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStep9Data(siteId: string, data: any) {
  try {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');
    await connectDB();
    const site = await Site.findByIdAndUpdate(siteId, {
      $set: { ...Object.keys(data).reduce((acc, key) => ({ ...acc, [`step9Data.${key}`]: data[key] }), {}), 'step9Data.updatedBy': session.user.name, 'step9Data.updatedAt': new Date() },
      $push: { timeline: { action: 'Step 9 Updated', description: 'Warranty & Accessories updated', performedBy: session.user.name, timestamp: new Date() } }
    }, { new: true });
    if (!site) throw new Error('Site not found');
    revalidatePath('/admin/sites');
    revalidatePath(`/admin/sites/${siteId}`);
    return { success: true, data: JSON.parse(JSON.stringify(site)), message: 'Step 9 updated successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
