import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document<mongoose.Types.ObjectId> {
  name: string;
  email: string;
  createDate: Date;
  updateDate: Date;
  roles: string[]; // Array of roles, e.g., ['member', 'admin']
  lastLoggedIn?: Date;
  assignedCollections: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    roles: {
      type: [String],
      enum: ['member', 'admin'],
      default: ['member'],
    },
    lastLoggedIn: { type: Date },
    assignedCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'createDate',
      updatedAt: 'updateDate',
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
