import mongoose, { Schema, Model } from 'mongoose';
import { Task as ITask } from '@/types';

interface TaskDocument extends Omit<ITask, '_id'>, mongoose.Document {}

const TaskSchema = new Schema<TaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    site: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      required: [true, 'Site is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned employee is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    completedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ site: 1 });
TaskSchema.index({ deadline: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ createdAt: -1 }); // For sorting by creation date

const Task: Model<TaskDocument> = mongoose.models.Task || mongoose.model<TaskDocument>('Task', TaskSchema);

export default Task;
