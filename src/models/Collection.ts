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
      unique: true,
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
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
  }
);

export const Collection =
  (mongoose.models.Collection as mongoose.Model<ICollection>) ||
  mongoose.model<ICollection>('Collection', CollectionSchema);
