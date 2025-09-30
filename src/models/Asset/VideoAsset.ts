import { Schema } from 'mongoose';
import { BaseAsset, IBaseAsset } from './BaseAsset';

export interface IVideoAsset extends IBaseAsset {
  format: 'mp4' | 'avi' | 'mov' | 'wmv' | 'flv' | 'webm';
}

const VideoAssetSchema: Schema = new Schema({
  format: {
    type: String,
    enum: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    required: [true, 'Video format is required'],
  },
});

export const VideoAsset = BaseAsset.discriminator<IVideoAsset>(
  'VideoAsset',
  VideoAssetSchema
);
