import mongoose, { Document } from 'mongoose';

import { AudioAsset } from './Asset/AudioAsset';
import { ImageAsset } from './Asset/ImageAsset';
import { VideoAsset } from './Asset/VideoAsset';

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

StorylineSchema.post('findOneAndUpdate', async function (doc) {
  try {
    console.log(`Post-save hook triggered for storyline: ${doc.title}`);

    // Only process preview storylines (published ones have embedded assets)
    if (doc.status !== 'preview') {
      return;
    }

    // Create location info
    const collectionIds = doc.collections.join(',');
    const locationInfo = `${collectionIds}:${doc._id}`;

    console.log(`Location info: ${locationInfo}`);

    // Collect all asset IDs currently in use
    const currentImageAssetIds = new Set<string>();
    const currentAudioAssetIds = new Set<string>();
    const currentVideoAssetIds = new Set<string>();

    // Collect ImageAsset IDs from bags
    if (doc.bags) {
      const columns: (keyof typeof doc.bags)[] = [
        'firstColumn',
        'secondColumn',
        'thirdColumn',
      ];

      columns.forEach((column) => {
        doc.bags?.[column].forEach((bag: any) => {
          if (bag.imageAsset) {
            currentImageAssetIds.add(bag.imageAsset.toString());
          }
        });
      });
    }

    // Collect AudioAsset and VideoAsset IDs from stories
    doc.stories.forEach((story: any) => {
      if (story.audioAsset) {
        currentAudioAssetIds.add(story.audioAsset.toString());
      }

      if (story.events && Array.isArray(story.events)) {
        story.events.forEach((event: any) => {
          if (event.videoAsset) {
            currentVideoAssetIds.add(event.videoAsset.toString());
          }
        });
      }
    });

    console.log('Cleaning up all previous location references...');

    await Promise.all([
      ImageAsset.updateMany(
        { location: locationInfo },
        { $pull: { location: locationInfo } }
      ),
      AudioAsset.updateMany(
        { location: locationInfo },
        { $pull: { location: locationInfo } }
      ),
      VideoAsset.updateMany(
        { location: locationInfo },
        { $pull: { location: locationInfo } }
      ),
    ]);

    console.log('Cleaned up all previous location references');

    // **Then add location to currently used assets**

    // Update ImageAssets
    if (currentImageAssetIds.size > 0) {
      await ImageAsset.updateMany(
        { _id: { $in: Array.from(currentImageAssetIds) } },
        { $addToSet: { location: locationInfo } }
      );

      console.log(`Added location to ${currentImageAssetIds.size} ImageAssets`);
    }

    // Update AudioAssets
    if (currentAudioAssetIds.size > 0) {
      await AudioAsset.updateMany(
        { _id: { $in: Array.from(currentAudioAssetIds) } },
        { $addToSet: { location: locationInfo } }
      );

      console.log(`Added location to ${currentAudioAssetIds.size} AudioAssets`);
    }

    // Update VideoAssets
    if (currentVideoAssetIds.size > 0) {
      await VideoAsset.updateMany(
        { _id: { $in: Array.from(currentVideoAssetIds) } },
        { $addToSet: { location: locationInfo } }
      );

      console.log(`Added location to ${currentVideoAssetIds.size} VideoAssets`);
    }

    console.log('Location update completed successfully');
  } catch (error) {
    console.error('Error in Storyline post-save hook:', error);
    // Don't throw the error to avoid breaking the save operation
  }
});

StorylineSchema.post('deleteOne', async function (doc) {
  if (!doc) return;

  try {
    console.log(`Post-deleteOne hook triggered for storyline: ${doc.title}`);

    const collectionIds = doc.collections.join(',');
    const locationInfo = `${collectionIds}:${doc._id}`;

    console.log(
      `Cleaning up location references for deleted storyline: ${locationInfo}`
    );

    // Remove this storyline's location from all assets
    await Promise.all([
      ImageAsset.updateMany(
        { location: locationInfo },
        { $pull: { location: locationInfo } }
      ),
      AudioAsset.updateMany(
        { location: locationInfo },
        { $pull: { location: locationInfo } }
      ),
      VideoAsset.updateMany(
        { location: locationInfo },
        { $pull: { location: locationInfo } }
      ),
    ]);

    console.log(
      `Successfully cleaned up asset locations for deleted storyline: ${doc.title}`
    );
  } catch (error) {
    console.error('Error in Storyline post-deleteOne hook:', error);
  }
});

export const Storyline =
  (mongoose.models.Storyline as mongoose.Model<IStoryline>) ||
  mongoose.model<IStoryline>('Storyline', StorylineSchema);
