import mongoose from 'mongoose';

export interface IInfo {
  en: string;
  nl: string;
  createDate: Date;
  updateDate: Date;
}

const InfoSchema = new mongoose.Schema(
  {
    en: { type: String, default: '' },
    nl: { type: String, default: '' },
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
  }
);

export const Info =
  (mongoose.models.Info as mongoose.Model<IInfo>) ||
  mongoose.model<IInfo>('Info', InfoSchema);
