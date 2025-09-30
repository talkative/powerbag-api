import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ImageAsset, VideoAsset, AudioAsset } from '../models/Asset';
import { CreateImageAssetDto } from '../dtos/CreateAsset.dto';
import { HTTP_STATUS } from '../constants/httpStatusCodes';
import { AuthenticatedRequest } from '../types/response';
import { S3Service } from '../utils/s3';

// Initialize S3 service
const s3Service = new S3Service();

// Configure multer for temporary file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = {
    image: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    video: [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm',
    ],
    audio: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'],
  };

  // Asset type detection from path
  const pathSegments = req.path.split('/');
  let assetType: string | undefined;

  // Look for asset type keywords in path segments
  for (const segment of pathSegments) {
    if (['image', 'video', 'audio'].includes(segment)) {
      assetType = segment;
      break;
    }
  }

  if (!assetType) {
    return cb(new Error('Unable to determine asset type from request path'));
  }

  const validTypes = allowedTypes[assetType as keyof typeof allowedTypes] || [];

  if (validTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type for ${assetType} upload. Allowed types: ${validTypes.join(
          ', '
        )}`
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Helper function to clean up temporary file
const cleanupTempFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

export const uploadMultipleImageAssets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const tempFilePaths: string[] = [];

  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { altText }: CreateImageAssetDto = req.body;
    const files = req.files as Express.Multer.File[];

    // Store temp file paths for cleanup
    tempFilePaths.push(...files.map((file) => file.path));

    const uploadedAssets = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Generate S3 key and upload to S3
        const s3Key = s3Service.generateKey(
          userId!,
          'image',
          file.originalname
        );

        const s3Url = await s3Service.uploadFile(
          file.path,
          s3Key,
          file.mimetype,
          {
            originalName: file.originalname,
            uploadedBy: userId!,
            assetType: 'image',
          }
        );

        // Extract format from mimetype
        const format = file.mimetype.split('/')[1] as any;
        const location: string[] = [];

        const imageAsset = new ImageAsset({
          filename: s3Key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: s3Url,
          uploadedBy: userId,
          location,
          format,
          altText,
        });

        await imageAsset.save();
        uploadedAssets.push(imageAsset);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Clean up all temporary files
    tempFilePaths.forEach(cleanupTempFile);

    const response = {
      success: true,
      message: `Successfully uploaded ${uploadedAssets.length} of ${files.length} image assets`,
      data: {
        uploaded: uploadedAssets,
        errors: errors.length > 0 ? errors : undefined,
      },
    };

    res.status(HTTP_STATUS.CREATED).json(response);
  } catch (error) {
    // Clean up temporary files in case of error
    tempFilePaths.forEach(cleanupTempFile);

    console.error('Error uploading multiple image assets:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to upload image assets',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const uploadMultipleVideoAssets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const tempFilePaths: string[] = [];

  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const files = req.files as Express.Multer.File[];

    // Store temp file paths for cleanup
    tempFilePaths.push(...files.map((file) => file.path));

    const uploadedAssets = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Generate S3 key and upload to S3
        const s3Key = s3Service.generateKey(userId, 'video', file.originalname);
        const s3Url = await s3Service.uploadFile(
          file.path,
          s3Key,
          file.mimetype,
          {
            originalName: file.originalname,
            uploadedBy: userId,
            assetType: 'video',
          }
        );

        // Extract format from file extension
        const format = path
          .extname(file.originalname)
          .slice(1)
          .toLowerCase() as any;

        const location: string[] = [];

        const videoAsset = new VideoAsset({
          filename: s3Key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: s3Url,
          uploadedBy: userId,
          location,
          format,
        });

        await videoAsset.save();
        uploadedAssets.push(videoAsset);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Clean up all temporary files
    tempFilePaths.forEach(cleanupTempFile);

    const response = {
      success: true,
      message: `Successfully uploaded ${uploadedAssets.length} of ${files.length} video assets`,
      data: {
        uploaded: uploadedAssets,
        errors: errors.length > 0 ? errors : undefined,
      },
    };

    res.status(HTTP_STATUS.CREATED).json(response);
  } catch (error) {
    // Clean up temporary files in case of error
    tempFilePaths.forEach(cleanupTempFile);

    console.error('Error uploading multiple video assets:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to upload video assets',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const uploadMultipleAudioAssets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const tempFilePaths: string[] = [];

  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const files = req.files as Express.Multer.File[];

    // Store temp file paths for cleanup
    tempFilePaths.push(...files.map((file) => file.path));

    const uploadedAssets = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Generate S3 key and upload to S3
        const s3Key = s3Service.generateKey(userId, 'audio', file.originalname);
        const s3Url = await s3Service.uploadFile(
          file.path,
          s3Key,
          file.mimetype,
          {
            originalName: file.originalname,
            uploadedBy: userId,
            assetType: 'audio',
          }
        );

        // Extract format from file extension
        const format = path
          .extname(file.originalname)
          .slice(1)
          .toLowerCase() as any;

        const location: string[] = [];

        const audioAsset = new AudioAsset({
          filename: s3Key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: s3Url,
          uploadedBy: userId,
          format,
          location,
        });

        await audioAsset.save();
        uploadedAssets.push(audioAsset);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Clean up all temporary files
    tempFilePaths.forEach(cleanupTempFile);

    const response = {
      success: true,
      message: `Successfully uploaded ${uploadedAssets.length} of ${files.length} audio assets`,
      data: {
        uploaded: uploadedAssets,
        errors: errors.length > 0 ? errors : undefined,
      },
    };

    res.status(HTTP_STATUS.CREATED).json(response);
  } catch (error) {
    // Clean up temporary files in case of error
    tempFilePaths.forEach(cleanupTempFile);

    console.error('Error uploading multiple audio assets:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to upload audio assets',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get assets by type
export const getAssetsByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 100, uploadedBy } = req.query;

    // Build query filter
    const filter: any = {};

    if (uploadedBy) {
      filter.uploadedBy = uploadedBy;
    }

    const skip = (Number(page) - 1) * Number(limit);
    let assets: any[] = [];
    let total = 0;

    // Query the appropriate model based on type
    switch (type) {
      case 'image':
        assets = await ImageAsset.find(filter)
          .populate('uploadedBy', 'email')
          .sort({ createDate: -1 })
          .skip(skip)
          .limit(Number(limit));
        total = await ImageAsset.countDocuments(filter);
        break;
      case 'video':
        assets = await VideoAsset.find(filter)
          .populate('uploadedBy', 'email')
          .sort({ createDate: -1 })
          .skip(skip)
          .limit(Number(limit));
        total = await VideoAsset.countDocuments(filter);
        break;
      case 'audio':
        assets = await AudioAsset.find(filter)
          .populate('uploadedBy', 'email')
          .sort({ createDate: -1 })
          .skip(skip)
          .limit(Number(limit));
        total = await AudioAsset.countDocuments(filter);
        break;
      default:
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid asset type. Must be image, video, or audio',
        });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: assets,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch assets',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get asset by ID - supports all asset types
export const getAssetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Try to find the asset in all asset types
    let asset: any = null;
    let assetType = '';

    // Try ImageAsset first
    asset = await ImageAsset.findById(id).populate('uploadedBy', 'email');
    if (asset) {
      assetType = 'image';
    }

    // Try VideoAsset if not found
    if (!asset) {
      asset = await VideoAsset.findById(id).populate('uploadedBy', 'email');
      if (asset) {
        assetType = 'video';
      }
    }

    // Try AudioAsset if still not found
    if (!asset) {
      asset = await AudioAsset.findById(id).populate('uploadedBy', 'email');
      if (asset) {
        assetType = 'audio';
      }
    }

    if (!asset) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        ...asset.toObject(),
        type: assetType,
      },
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch asset',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete asset - now deletes from S3 as well and supports all asset types
export const deleteAsset = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Try to find the asset in all asset types
    let asset: any = null;
    let assetType = '';

    // Try ImageAsset first
    asset = await ImageAsset.findById(id);
    if (asset) {
      assetType = 'image';
    }

    // Try VideoAsset if not found
    if (!asset) {
      asset = await VideoAsset.findById(id);
      if (asset) {
        assetType = 'video';
      }
    }

    // Try AudioAsset if still not found
    if (!asset) {
      asset = await AudioAsset.findById(id);
      if (asset) {
        assetType = 'audio';
      }
    }

    if (!asset) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Check if user owns the asset or has admin privileges
    if (asset.uploadedBy.toString() !== userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You can only delete your own assets',
      });
    }

    // Delete from S3
    await s3Service.deleteFile(asset.filename);

    // Delete from database using the correct model
    if (assetType === 'image') {
      await ImageAsset.findByIdAndDelete(id);
    } else if (assetType === 'video') {
      await VideoAsset.findByIdAndDelete(id);
    } else if (assetType === 'audio') {
      await AudioAsset.findByIdAndDelete(id);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `${
        assetType.charAt(0).toUpperCase() + assetType.slice(1)
      } asset deleted successfully`,
      data: {
        id: asset._id,
        type: assetType,
        originalName: asset.originalName,
      },
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete asset',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete all assets - deletes from S3 and database
export const deleteAllAssets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get all assets for the user
    const imageAssets = await ImageAsset.find({ uploadedBy: userId });
    const videoAssets = await VideoAsset.find({ uploadedBy: userId });
    const audioAssets = await AudioAsset.find({ uploadedBy: userId });

    const allAssets = [
      ...imageAssets.map((asset) => ({ ...asset.toObject(), type: 'image' })),
      ...videoAssets.map((asset) => ({ ...asset.toObject(), type: 'video' })),
      ...audioAssets.map((asset) => ({ ...asset.toObject(), type: 'audio' })),
    ];

    if (allAssets.length === 0) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'No assets found to delete',
        data: {
          deletedCount: 0,
        },
      });
    }

    const errors = [];
    let deletedCount = 0;

    // Delete each asset from S3 and database
    for (const asset of allAssets) {
      try {
        // Delete from S3
        await s3Service.deleteFile(asset.filename);

        // Delete from database using the correct model
        if (asset.type === 'image') {
          await ImageAsset.findByIdAndDelete(asset._id);
        } else if (asset.type === 'video') {
          await VideoAsset.findByIdAndDelete(asset._id);
        } else if (asset.type === 'audio') {
          await AudioAsset.findByIdAndDelete(asset._id);
        }

        deletedCount++;
      } catch (error) {
        errors.push({
          id: asset._id,
          filename: asset.originalName,
          type: asset.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Successfully deleted ${deletedCount} of ${allAssets.length} assets`,
      data: {
        deletedCount,
        totalAssets: allAssets.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Error deleting all assets:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete all assets',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
