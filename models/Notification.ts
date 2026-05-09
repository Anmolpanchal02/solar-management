import mongoose, { Schema, Model } from 'mongoose';
import { Notification as INotification } from '@/types';

interface NotificationDocument extends Omit<INotification, '_id'>, mongoose.Document {}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['task', 'visit', 'attendance', 'general'],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedTo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification: Model<NotificationDocument> = mongoose.models.Notification || mongoose.model<NotificationDocument>('Notification', NotificationSchema);

export default Notification;
