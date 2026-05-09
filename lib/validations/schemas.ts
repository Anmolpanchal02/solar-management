import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  role: z.enum(['admin', 'employee']),
});

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  role: z.enum(['admin', 'employee']),
  avatar: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Site schemas
export const createSiteSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  installationType: z.string().optional(),
  assignedEmployee: z.string().optional(),
});

export const updateSiteSchema = z.object({
  customerName: z.string().min(2).optional(),
  customerPhone: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  installationType: z.string().min(2).optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'on-hold']).optional(),
  assignedEmployee: z.string().optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  site: z.string().min(1, 'Site is required'),
  assignedTo: z.string().min(1, 'Assigned employee is required'),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.string().or(z.date()),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  deadline: z.string().or(z.date()).optional(),
});

// Visit schemas
export const createVisitSchema = z.object({
  site: z.string().min(1, 'Site is required'),
  task: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: z.string().optional(),
  beforeImages: z.array(z.string()).optional(),
});

export const updateVisitSchema = z.object({
  checkOutTime: z.string().or(z.date()).optional(),
  afterImages: z.array(z.string()).optional(),
  notes: z.string().optional(),
  workCompletionPercentage: z.number().min(0).max(100).optional(),
  status: z.enum(['in-progress', 'completed']).optional(),
});

// Attendance schemas
export const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const checkOutSchema = z.object({
  attendanceId: z.string().min(1, 'Attendance ID is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
