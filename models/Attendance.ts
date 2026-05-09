import mongoose, { Schema, Model } from 'mongoose';
import { Attendance as IAttendance } from '@/types';

interface AttendanceDocument extends Omit<IAttendance, '_id'>, mongoose.Document {}

const AttendanceSchema = new Schema<AttendanceDocument>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day'],
      default: 'present',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AttendanceSchema.index({ employee: 1, date: -1 });
AttendanceSchema.index({ date: -1 });
AttendanceSchema.index({ location: '2dsphere' });

// Ensure one attendance record per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance: Model<AttendanceDocument> = mongoose.models.Attendance || mongoose.model<AttendanceDocument>('Attendance', AttendanceSchema);

export default Attendance;
