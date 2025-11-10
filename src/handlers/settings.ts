// Create a new file: src/handlers/settings.ts
import { Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { Collection } from '../models/Collection';
import { HTTP_STATUS } from '../constants/httpStatusCodes';

// Get all settings (admin only)
export async function getSettings(req: Request, res: Response) {
  try {
    const settings = await Settings.find().sort({ category: 1, key: 1 });

    res.status(HTTP_STATUS.OK).json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to get settings',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Get public settings (for frontend)
export async function getPublicSettings(req: Request, res: Response) {
  try {
    const publicSettings = await Settings.getPublicSettings();

    res.status(HTTP_STATUS.OK).json(publicSettings);
  } catch (error) {
    console.error('Error getting public settings:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to get public settings',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Update a setting (admin only)
export async function updateSetting(req: Request, res: Response) {
  try {
    const { key, value, type, description, category, isPublic } = req.body;

    if (!key || value === undefined || !type) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'key, value, and type are required',
      });
    }

    // Validate specific settings
    if (key === 'websiteCollection') {
      // Ensure the collection exists
      const collectionExists = await Collection.findById(value);

      if (!collectionExists) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: 'Invalid collection ID for websiteCollection setting',
        });
      }
    }

    const setting = await Settings.setSetting(key, value, type, {
      description,
      category,
      isPublic,
    });

    res.status(HTTP_STATUS.OK).json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update setting',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Get a specific setting
export async function getSetting(req: Request, res: Response) {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Setting key is required',
      });
    }

    const value = await Settings.getSetting(key);

    if (value === null) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Setting not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({ key, value });
  } catch (error) {
    console.error('Error getting setting:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to get setting',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Initialize default settings
export async function initializeDefaultSettings() {
  try {
    // Set default collection if not exists
    const websiteCollectionExists = await Settings.findOne({
      key: 'websiteCollection',
    });

    if (!websiteCollectionExists) {
      // Get the first collection as default
      const firstCollection = await Collection.findOne({
        status: 'published',
      }).sort({ createdAt: 1 });

      if (firstCollection && firstCollection._id) {
        await Settings.setSetting(
          'websiteCollection',
          firstCollection._id.toString(),
          'objectId',
          {
            description: 'Website collection displayed on the website',
            category: 'website',
            isPublic: true,
          }
        );
      }
    }

    console.log('Default settings initialized');
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
}
