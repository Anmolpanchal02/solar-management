export type UserRole = 'admin' | 'employee';

export type SiteStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  _id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  installationType: string;
  status: SiteStatus;
  assignedEmployee?: User | string;
  progressPercentage: number;
  step1Documents?: {
    billImage?: string;
    aadharImage?: string;
    cancelledChequeImage?: string;
    uploadedBy?: string;
    uploadedAt?: Date;
  };
  step2Data?: {
    kilowatt?: number;
    updatedBy?: string;
    updatedAt?: Date;
  };
  step3Data?: {
    structure?: Array<{
      size: string;
      numberOfPipes: number;
    }>;
    updatedBy?: string;
    updatedAt?: Date;
  };
  step4Data?: {
    moduleWatt?: number;
    moduleQuantity?: number;
    dcWireLength?: number;
    acWireLength?: number;
    updatedBy?: string;
    updatedAt?: Date;
  };
  step5Data?: {
    dcdbType?: string; // Single String or Double String
    acdbType?: string; // Single Phase or Three Phase
    updatedBy?: string;
    updatedAt?: Date;
  };
  step6Data?: {
    earthingType?: string;
    earthingDetails?: string;
    lightningArrester?: string;
    updatedBy?: string;
    updatedAt?: Date;
  };
  step7Data?: {
    inverterBrand?: string;
    inverterCapacity?: string;
    inverterModel?: string;
    netMeterBrand?: string;
    netMeterModel?: string;
    updatedBy?: string;
    updatedAt?: Date;
  };
  step8Data?: {
    monitoringSystem?: string;
    installationDate?: Date;
    commissioningDate?: Date;
    updatedBy?: string;
    updatedAt?: Date;
  };
  step9Data?: {
    warrantyYears?: number;
    warrantyDetails?: string;
    otherAccessories?: string;
    updatedBy?: string;
    updatedAt?: Date;
  };
  timeline: TimelineEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEntry {
  action: string;
  description: string;
  performedBy: string;
  timestamp: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  site: Site | string;
  assignedTo: User | string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: Date;
  completedAt?: Date;
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Visit {
  _id: string;
  employee: User | string;
  site: Site | string;
  task?: Task | string;
  visitDate: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  beforeImages: string[];
  afterImages: string[];
  notes: string;
  workCompletionPercentage: number;
  status: 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  _id: string;
  employee: User | string;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: 'present' | 'absent' | 'half-day';
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'visit' | 'task' | 'attendance' | 'report';
  relatedTo?: string; // ID of related entity
  employee?: User | string;
  site?: Site | string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  user: User | string;
  title: string;
  message: string;
  type: 'task' | 'visit' | 'attendance' | 'general';
  isRead: boolean;
  relatedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalEmployees: number;
  totalSites: number;
  completedInstallations: number;
  pendingTasks: number;
  dailyVisits: number;
  monthlyReports: number;
  activeEmployees: number;
  sitesInProgress: number;
}

export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  completedTasks: number;
  pendingTasks: number;
  totalVisits: number;
  attendanceRate: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}
