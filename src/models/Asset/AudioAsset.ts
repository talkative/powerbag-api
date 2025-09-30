import { Schema } from 'mongoose';
import { BaseAsset, IBaseAsset } from './BaseAsset';

export interface IAudioAsset extends IBaseAsset {
  format: 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg';
}

const AudioAssetSchema: Schema = new Schema({
  format: {
    type: String,
    enum: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
    required: [true, 'Audio format is required'],
  },
});

export const AudioAsset = BaseAsset.discriminator<IAudioAsset>(
  'AudioAsset',
  AudioAssetSchema
);
