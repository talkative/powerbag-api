import mongoose, { Document, Schema } from 'mongoose';

export interface IBaseAsset extends Document<mongoose.Types.ObjectId> {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: mongoose.Types.ObjectId;
  tags: string[];
  description?: string;
  isPublic: boolean;
  createDate: Date;
  updateDate: Date;
}

const BaseAssetSchema: Schema = new Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original name is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size must be positive'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
    discriminatorKey: 'assetType',
  }
);

// Index for efficient queries
BaseAssetSchema.index({ uploadedBy: 1, assetType: 1 });
BaseAssetSchema.index({ tags: 1 });
BaseAssetSchema.index({ isPublic: 1 });

export const BaseAsset = mongoose.model<IBaseAsset>('BaseAsset', BaseAssetSchema);