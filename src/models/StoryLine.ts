import mongoose from 'mongoose';

export interface IBag {
  id: string;
  imageUrl: string;
  videoUrl?: string | null;
  imageFrameUrls?: string[] | null;
}

export interface IEvent {
  start: number;
  stop: number;
  action: string;
  bags: string[];
}

export interface IStory {
  id: string;
  audioSrc: string;
  selectedBags: string[];
  events: IEvent[];
}

export interface IBags {
  firstColumn: IBag[];
  secondColumn: IBag[];
  thirdColumn: IBag[];
}

export interface IStoryLine extends Document {
  title: string;
  status: 'preview' | 'published';
  bags: IBags;
  stories: IStory[];
  createDate: Date;
  updateDate: Date;
}

const bagSchema = new mongoose.Schema(
  {
    id: String,
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
  },
  { _id: false, timestamps: false }
);

const storySchema = new mongoose.Schema(
  {
    id: String,
    audioSrc: String,
    selectedBags: [String],
    events: [eventSchema],
  },
  { _id: false, timestamps: false }
);

const StoryLineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: { type: String, required: true, enum: ['preview', 'published'] },
    bags: {
      firstColumn: [bagSchema],
      secondColumn: [bagSchema],
      thirdColumn: [bagSchema],
    },
    stories: [storySchema],
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
  }
);

export const StoryLine =
  (mongoose.models.StoryLine as mongoose.Model<IStoryLine>) ||
  mongoose.model<IStoryLine>('StoryLine', StoryLineSchema);
