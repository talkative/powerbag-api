import mongoose, { Document } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  status: 'preview' | 'published';
  publishedDate?: Date;
  previewVersionId?: mongoose.Types.ObjectId;
  createDate: Date;
  updateDate: Date;
}

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['preview', 'published'],
      default: 'preview',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previewVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    publishedDate: {
      type: Date,
      default: null, // Only set when the preview collection gets published
    },
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
  }
);

CollectionSchema.index({ status: 1 });
CollectionSchema.index({ previewVersionId: 1 });
CollectionSchema.index({ name: 1 });

export const Collection = mongoose.model<ICollection>(
  'Collection',
  CollectionSchema
);
