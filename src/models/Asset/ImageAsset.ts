import { Schema } from 'mongoose';
import { BaseAsset, IBaseAsset } from './BaseAsset';

export interface IImageAsset extends IBaseAsset {
  width: number;
  height: number;
  format: 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp' | 'svg';
  thumbnailUrl?: string;
  altText?: string;
  exifData?: {
    camera?: string;
    lens?: string;
    iso?: number;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
  };
}

const ImageAssetSchema: Schema = new Schema({
  width: {
    type: Number,
    required: [true, 'Image width is required'],
    min: [1, 'Width must be positive'],
  },
  height: {
    type: Number,
    required: [true, 'Image height is required'],
    min: [1, 'Height must be positive'],
  },
  format: {
    type: String,
    enum: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'],
    required: [true, 'Image format is required'],
  },
  thumbnailUrl: {
    type: String,
  },
  altText: {
    type: String,
    trim: true,
    maxlength: [200, 'Alt text cannot exceed 200 characters'],
  },
  exifData: {
    camera: String,
    lens: String,
    iso: Number,
    focalLength: String,
    aperture: String,
    shutterSpeed: String,
  },
});

export const ImageAsset = BaseAsset.discriminator<IImageAsset>(
  'ImageAsset',
  ImageAssetSchema
);
