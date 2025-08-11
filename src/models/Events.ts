import mongoose from 'mongoose';

export interface ISingleEvent {
  start: number;
  stop: number;
  action: string;
  bags: string[];
}

export interface IEvents {
  data: ISingleEvent[];
}

const SingleEventSchema = new mongoose.Schema(
  {
    event: String,
    timestamp: String,
    storyId: String,
    storylineTitle: String,
  },
  { _id: false, timestamps: false }
);

const EventsSchema = new mongoose.Schema(
  {
    data: [SingleEventSchema],
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
  }
);

export const Events =
  (mongoose.models.Events as mongoose.Model<IEvents>) ||
  mongoose.model<IEvents>('Events', EventsSchema);
