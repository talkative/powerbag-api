// Create a new file: src/models/Settings.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISettings extends Document {
  key: string; // Unique setting key (e.g., 'defaultCollection', 'siteTitle', etc.)
  value: any; // The setting value (can be string, number, object, etc.)
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'objectId';
  description?: string; // Optional description of what this setting does
  category?: string; // Optional category for grouping settings
  isPublic: boolean; // Whether this setting can be accessed by frontend
  createDate: Date;
  updateDate: Date;
}

// Define the static methods interface
export interface ISettingsModel extends Model<ISettings> {
  getSetting(key: string): Promise<any>;
  setSetting(
    key: string,
    value: any,
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'objectId',
    options?: {
      description?: string;
      category?: string;
      isPublic?: boolean;
    }
  ): Promise<ISettings>;
  getPublicSettings(): Promise<Record<string, any>>;
  getSettingsByCategory(category: string): Promise<ISettings[]>;
}

const SettingsSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed, // Allows any data type
      required: true,
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array', 'objectId'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    isPublic: {
      type: Boolean,
      default: false, // Most settings should be private by default
    },
  },
  {
    timestamps: true,
    createdAt: 'createDate',
    updatedAt: 'updateDate',
  }
);

// Add helper methods
SettingsSchema.statics.getSetting = async function (key: string): Promise<any> {
  const setting = await this.findOne({ key });
  return setting ? setting.value : null;
};

SettingsSchema.statics.setSetting = async function (
  key: string,
  value: any,
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'objectId',
  options?: {
    description?: string;
    category?: string;
    isPublic?: boolean;
  }
): Promise<ISettings> {
  // First check if setting already exists
  const existingSetting = await this.findOne({ key });

  // Build update object, preserving existing values when options are undefined
  const updateData: any = {
    key,
    value,
    type,
  };

  // Only update description if explicitly provided
  if (options?.description !== undefined) {
    updateData.description = options.description;
  } else if (!existingSetting) {
    updateData.description = undefined; // New setting, no description
  }
  // If exists and description not provided, preserve existing value (don't set in updateData)

  // Only update category if explicitly provided
  if (options?.category !== undefined) {
    updateData.category = options.category;
  } else if (!existingSetting) {
    updateData.category = 'general'; // New setting, default category
  }
  // If exists and category not provided, preserve existing value

  // Only update isPublic if explicitly provided
  if (options?.isPublic !== undefined) {
    updateData.isPublic = options.isPublic;
  } else if (!existingSetting) {
    updateData.isPublic = false; // New setting, default to private
  }
  // If exists and isPublic not provided, preserve existing value

  return await this.findOneAndUpdate({ key }, updateData, {
    upsert: true,
    new: true,
  });
};

SettingsSchema.statics.getPublicSettings = async function (): Promise<
  Record<string, any>
> {
  const settings = await this.find({ isPublic: true });
  const result: Record<string, any> = {};

  settings.forEach((setting: ISettings) => {
    result[setting.key] = setting.value;
  });

  return result;
};

SettingsSchema.statics.getSettingsByCategory = async function (
  category: string
): Promise<ISettings[]> {
  return await this.find({ category });
};

export const Settings = mongoose.model<ISettings, ISettingsModel>(
  'Settings',
  SettingsSchema
);
