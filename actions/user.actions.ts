'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { auth } from '@/lib/auth/auth';
import { createUserSchema, updateUserSchema } from '@/lib/validations/schemas';

export async function getUsers() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(users)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEmployees() {
  try {
    await connectDB();
    const employees = await User.find({ role: 'employee', isActive: true })
      .select('-password')
      .sort({ name: 1 })
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(employees)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserById(id: string) {
  try {
    await connectDB();
    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createUser(data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const validatedData = createUserSchema.parse(data);

    await connectDB();

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await User.create(validatedData);

    revalidatePath('/admin/employees');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(user)),
      message: 'User created successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const validatedData = updateUserSchema.parse(data);

    await connectDB();

    const user = await User.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    revalidatePath('/admin/employees');
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(user)),
      message: 'User updated successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new Error('User not found');
    }

    revalidatePath('/admin/employees');
    
    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleUserStatus(id: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    revalidatePath('/admin/employees');
    
    return {
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
