import { Schema } from 'mongoose';
import { BaseAsset, IBaseAsset } from './BaseAsset';

export interface IVideoAsset extends IBaseAsset {
  duration: number;
  width?: number;
  height?: number;
  format: 'mp4' | 'avi' | 'mov' | 'wmv' | 'flv' | 'webm';
  bitrate?: number;
  frameRate?: number;
  thumbnailUrl?: string;
  previewUrl?: string;
  subtitles?: Array<{
    language: string;
    url: string;
  }>;
}

const VideoAssetSchema: Schema = new Schema({
  duration: {
    type: Number,
    required: [true, 'Video duration is required'],
    min: [0, 'Duration must be positive'],
  },
  width: {
    type: Number,
    min: [1, 'Width must be positive'],
  },
  height: {
    type: Number,
    min: [1, 'Height must be positive'],
  },
  format: {
    type: String,
    enum: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    required: [true, 'Video format is required'],
  },
  bitrate: {
    type: Number,
    min: [0, 'Bitrate must be positive'],
  },
  frameRate: {
    type: Number,
    min: [0, 'Frame rate must be positive'],
  },
  thumbnailUrl: {
    type: String,
  },
  previewUrl: {
    type: String,
  },
  subtitles: [
    {
      language: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
});

export const VideoAsset = BaseAsset.discriminator<IVideoAsset>(
  'VideoAsset',
  VideoAssetSchema
);
