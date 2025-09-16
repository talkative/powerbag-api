import { Schema } from 'mongoose';
import { BaseAsset, IBaseAsset } from './BaseAsset';

export interface IAudioAsset extends IBaseAsset {
  duration: number;
  format: 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg';
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  waveformUrl?: string;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: number;
  };
}

const AudioAssetSchema: Schema = new Schema({
  duration: {
    type: Number,
    required: [true, 'Audio duration is required'],
    min: [0, 'Duration must be positive'],
  },
  format: {
    type: String,
    enum: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
    required: [true, 'Audio format is required'],
  },
  bitrate: {
    type: Number,
    min: [0, 'Bitrate must be positive'],
  },
  sampleRate: {
    type: Number,
    min: [0, 'Sample rate must be positive'],
  },
  channels: {
    type: Number,
    min: [1, 'Channels must be at least 1'],
    max: [8, 'Channels cannot exceed 8'],
  },
  waveformUrl: {
    type: String,
  },
  metadata: {
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    artist: {
      type: String,
      trim: true,
      maxlength: [100, 'Artist name cannot exceed 100 characters'],
    },
    album: {
      type: String,
      trim: true,
      maxlength: [200, 'Album name cannot exceed 200 characters'],
    },
    genre: {
      type: String,
      trim: true,
      maxlength: [50, 'Genre cannot exceed 50 characters'],
    },
    year: {
      type: Number,
      min: [1900, 'Year must be after 1900'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
  },
});

export const AudioAsset = BaseAsset.discriminator<IAudioAsset>(
  'AudioAsset',
  AudioAssetSchema
);
