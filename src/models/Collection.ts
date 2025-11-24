import mongoose, { Document } from 'mongoose';

import { Storyline } from './Storyline';
import { AudioAsset } from './Asset/AudioAsset';
import { ImageAsset } from './Asset/ImageAsset';
import { VideoAsset } from './Asset/VideoAsset';

export interface ICollection extends Document {
  name: string;
  description?: string;
  status: 'preview' | 'published';
  publishedDate?: Date;
  previewVersionId?: mongoose.Types.ObjectId;
  createDate: Date;
  updateDate: Date;
}

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previewVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    publishedDate: {
      type: Date,
      default: null, // Only set when the preview collection gets published
    },
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
  }
);

CollectionSchema.index({ status: 1 });
CollectionSchema.index({ previewVersionId: 1 });
CollectionSchema.index({ name: 1 });

CollectionSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;

  try {
    console.log(`Post-deleteOne hook triggered for collection: ${doc.name}`);

    const storylines = await Storyline.find({ collections: doc._id });

    for (const storyline of storylines) {
      const locationInfo = `${doc._id}:${storyline._id}`;

      console.log(
        `Cleaning up location references for deleted collection: ${locationInfo}`
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
    }

    console.log(
      `Successfully cleaned up asset locations for deleted collection: ${doc.name}`
    );
  } catch (error) {
    console.error('Error in Storyline post-deleteOne hook:', error);
  }
});

export const Collection = mongoose.model<ICollection>(
  'Collection',
  CollectionSchema
);
