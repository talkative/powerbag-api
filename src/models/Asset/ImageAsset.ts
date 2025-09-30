import { Schema } from 'mongoose';
import { BaseAsset, IBaseAsset } from './BaseAsset';

export interface IImageAsset extends IBaseAsset {
  format: 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp' | 'svg';
  altText?: string;
}

const ImageAssetSchema: Schema = new Schema({
  format: {
    type: String,
    enum: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'],
    required: [true, 'Image format is required'],
  },
  altText: {
    type: String,
    trim: true,
    maxlength: [200, 'Alt text cannot exceed 200 characters'],
  },
});

export const ImageAsset = BaseAsset.discriminator<IImageAsset>(
  'ImageAsset',
  ImageAssetSchema
);
