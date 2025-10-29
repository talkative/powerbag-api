import mongoose, { Document } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  status: 'preview' | 'published';
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
    previewVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
  }
);

CollectionSchema.index({ name: 1, status: 1 }, { unique: true });

export const Collection = mongoose.model<ICollection>(
  'Collection',
  CollectionSchema
);
