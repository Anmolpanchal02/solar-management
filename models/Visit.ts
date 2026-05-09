import mongoose, { Schema, Model } from 'mongoose';
import { Visit as IVisit } from '@/types';

interface VisitDocument extends Omit<IVisit, '_id'>, mongoose.Document {}

const VisitSchema = new Schema<VisitDocument>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    site: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      required: [true, 'Site is required'],
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    visitDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkOutTime: {
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
    beforeImages: {
      type: [String],
      default: [],
    },
    afterImages: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    workCompletionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
VisitSchema.index({ employee: 1, visitDate: -1 });
VisitSchema.index({ site: 1 });
VisitSchema.index({ location: '2dsphere' });
VisitSchema.index({ status: 1 });

const Visit: Model<VisitDocument> = mongoose.models.Visit || mongoose.model<VisitDocument>('Visit', VisitSchema);

export default Visit;
