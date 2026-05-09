import mongoose, { Schema, Model } from 'mongoose';
import { Site as ISite } from '@/types';

interface SiteDocument extends Omit<ISite, '_id'>, mongoose.Document {}

// Timeline Entry Schema
const TimelineEntrySchema = new Schema({
  action: { type: String, required: true },
  description: { type: String, required: true },
  performedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const Step1DocumentsSchema = new Schema({
  billImage: { type: String, default: '' },
  aadharImage: { type: String, default: '' },
  cancelledChequeImage: { type: String, default: '' },
  uploadedBy: { type: String },
  uploadedAt: { type: Date },
}, { _id: false });

const Step2DataSchema = new Schema({
  kilowatt: { type: Number, default: 0, min: 0, max: 50 },
  updatedBy: { type: String },
  updatedAt: { type: Date },
}, { _id: false });

const StructureItemSchema = new Schema({
  size: { type: String, required: true }, // e.g., "75*75 mm"
  numberOfPipes: { type: Number, required: true, min: 0 },
}, { _id: false });

const Step3DataSchema = new Schema({
  structure: [StructureItemSchema],
  updatedBy: { type: String },
  updatedAt: { type: Date },
}, { _id: false });

const Step4DataSchema = new Schema({
  moduleWatt: { type: Number, default: 0 },
  moduleQuantity: { type: Number, default: 0 },
  dcWireLength: { type: Number, default: 0 },
  acWireLength: { type: Number, default: 0 },
  updatedBy: { type: String },
  updatedAt: { type: Date },
}, { _id: false });

const Step5DataSchema = new Schema({
  // DCDB - Single String or Double String
  dcdbType: { type: String, default: '' },
  
  // ACDB - Single Phase or Three Phase
  acdbType: { type: String, default: '' },
  
  updatedBy: { type: String },
  updatedAt: { type: Date },
}, { _id: false });

const Step6DataSchema = new Schema({
  // Earthing
  earthingType: { type: String, default: '' },
  earthingDetails: { type: String, default: '' },
  
  // Lightning Arrester
  lightningArrester: { type: String, default: '' },
  
  updatedBy: { type: String },
  updatedAt: { type: Date },
}, { _id: false });

const Step7DataSchema = new Schema({
  // Inverter
  inverterBrand: { type: String, default: '' },
  inverterCapacity: { type: String, default: '' },
  inverterModel: { type: String, default: '' },
  
  // Net Meter
  netMeterBrand: { type: String, default: '' },
  netMeterModel: { type: String, default: '' },
  
  updatedBy: { type: String },
  updatedAt: { type: Date },
}, { _id: false });

const Step8DataSchema = new Schema({
  // Monitoring System
  monitoringSystem: { type: String, default: '' },
  
  // Dates
  installationDate: { type: Date },
  commissioningDate: { type: Date },
  
  updatedBy: { type: String },
  updatedAt: { type: Date },
}, { _id: false });

const Step9DataSchema = new Schema({
  // Warranty
  warrantyYears: { type: Number, default: 0 },
  warrantyDetails: { type: String, default: '' },
  
  // Other
  otherAccessories: { type: String, default: '' },
  
  updatedBy: { type: String },
  updatedAt: { type: Date },
}, { _id: false });

const SiteSchema = new Schema<SiteDocument>(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
        required: false,
      },
    },
    installationType: {
      type: String,
      trim: true,
      required: false,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'on-hold'],
      default: 'pending',
    },
    assignedEmployee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    step1Documents: {
      type: Step1DocumentsSchema,
      default: () => ({}),
    },
    step2Data: {
      type: Step2DataSchema,
      default: () => ({}),
    },
    step3Data: {
      type: Step3DataSchema,
      default: () => ({}),
    },
    step4Data: {
      type: Step4DataSchema,
      default: () => ({}),
    },
    step5Data: {
      type: Step5DataSchema,
      default: () => ({}),
    },
    step6Data: {
      type: Step6DataSchema,
      default: () => ({}),
    },
    step7Data: {
      type: Step7DataSchema,
      default: () => ({}),
    },
    step8Data: {
      type: Step8DataSchema,
      default: () => ({}),
    },
    step9Data: {
      type: Step9DataSchema,
      default: () => ({}),
    },
    timeline: [TimelineEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location-based queries
SiteSchema.index({ location: '2dsphere' });
SiteSchema.index({ status: 1 });
SiteSchema.index({ assignedEmployee: 1 });
SiteSchema.index({ createdAt: -1 }); // For sorting by creation date
SiteSchema.index({ customerName: 1 }); // For searching by customer name

const Site: Model<SiteDocument> = mongoose.models.Site || mongoose.model<SiteDocument>('Site', SiteSchema);

export default Site;
