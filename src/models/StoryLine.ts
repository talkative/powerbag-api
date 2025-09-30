import mongoose, { Document } from 'mongoose';

// Embedded ImageAsset interface for published storylines
export interface IEmbeddedImageAsset {
  assetId: string;
  originalName: string;
  url: string;
  format: string;
}

export interface IEmbeddedAudioAsset {
  assetId: string;
  originalName: string;
  url: string;
  duration: number;
  format: string;
}

export interface IBag {
  id: string;
  // For preview: reference to ImageAsset
  imageAsset?: mongoose.Types.ObjectId;
  // For published: embedded ImageAsset data
  embeddedImageAsset?: IEmbeddedImageAsset;

  // Legacy fields (keep for backward compatibility)
  imageUrl: string;
  videoUrl?: string | null;
  imageFrameUrls?: string[] | null;
}

export interface IEvent {
  start: number;
  stop: number;
  action: string;
  bags: string[];
  videoAsset?: mongoose.Types.ObjectId;
}

export interface IStory {
  id: string;
  // For preview: reference to AudioAsset
  audioAsset?: mongoose.Types.ObjectId;
  // For published: embedded AudioAsset data
  embeddedAudioAsset?: IEmbeddedAudioAsset;

  // Legacy field
  audioSrc?: string;
  selectedBags: string[];
  events: IEvent[];
}

export interface IBags {
  firstColumn: IBag[];
  secondColumn: IBag[];
  thirdColumn: IBag[];
}

export interface IStoryline extends Document {
  title: string;
  status: 'preview' | 'published';
  bags: IBags;
  stories: IStory[];
  collections: mongoose.Types.ObjectId[];
  // For published storylines, link back to the original preview
  previewVersionId?: mongoose.Types.ObjectId;
  createDate: Date;
  updateDate: Date;
}

const embeddedImageAssetSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    format: { type: String, required: true },
  },
  { _id: false, timestamps: false }
);

const embeddedAudioAssetSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    duration: { type: Number, required: true },
    format: { type: String, required: true },
  },
  { _id: false, timestamps: false }
);

const bagSchema = new mongoose.Schema(
  {
    id: String,
    // Reference for preview storylines
    imageAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImageAsset',
    },
    // Embedded for published storylines
    embeddedImageAsset: embeddedImageAssetSchema,

    // Legacy field, to be deprecated
    imageUrl: String,
    videoUrl: { type: String, nullable: true },
    imageFrameUrls: { type: [String], nullable: true },
  },
  { _id: false, timestamps: false }
);

const eventSchema = new mongoose.Schema(
  {
    start: Number,
    stop: Number,
    action: String,
    bags: [String],
    videoAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoAsset',
      required: false,
    },
  },
  { timestamps: false }
);

const storySchema = new mongoose.Schema(
  {
    id: String,
    // Reference for preview storylines
    audioAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AudioAsset',
    },
    // Embedded for published storylines
    embeddedAudioAsset: embeddedAudioAssetSchema,

    // Legacy field, to be deprecated
    audioSrc: String,
    selectedBags: [String],
    events: [eventSchema],
  },
  { timestamps: false }
);

const StorylineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: { type: String, required: true, enum: ['preview', 'published'] },
    bags: {
      firstColumn: [bagSchema],
      secondColumn: [bagSchema],
      thirdColumn: [bagSchema],
    },
    stories: [storySchema],
    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],
    // Link back to preview version for published storylines
    previewVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Storyline',
    },
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
  }
);

export const Storyline =
  (mongoose.models.Storyline as mongoose.Model<IStoryline>) ||
  mongoose.model<IStoryline>('Storyline', StorylineSchema);
