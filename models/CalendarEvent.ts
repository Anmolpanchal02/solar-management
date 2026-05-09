import mongoose, { Schema, Model } from 'mongoose';
import { CalendarEvent as ICalendarEvent } from '@/types';

interface CalendarEventDocument extends Omit<ICalendarEvent, '_id'>, mongoose.Document {}

const CalendarEventSchema = new Schema<CalendarEventDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['visit', 'task', 'attendance', 'report'],
      required: true,
    },
    relatedTo: {
      type: String,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    site: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CalendarEventSchema.index({ start: 1, end: 1 });
CalendarEventSchema.index({ employee: 1 });
CalendarEventSchema.index({ type: 1 });

const CalendarEvent: Model<CalendarEventDocument> = mongoose.models.CalendarEvent || mongoose.model<CalendarEventDocument>('CalendarEvent', CalendarEventSchema);

export default CalendarEvent;
