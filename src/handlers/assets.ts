import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ImageAsset, VideoAsset, AudioAsset } from '../models/Asset';
import {
  CreateImageAssetDto,
  CreateVideoAssetDto,
  CreateAudioAssetDto,
} from '../dtos/CreateAsset.dto';
import { HTTP_STATUS } from '../constants/httpStatusCodes';
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

  const assetType = req.path.split('/')[2]; // Extract asset type from route
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

// Helper function to get image dimensions (simplified - in production, use sharp or similar)
const getImageDimensions = async (
  filePath: string
): Promise<{ width: number; height: number }> => {
  // This is a placeholder - in production, use a library like sharp to get actual dimensions
  return { width: 1920, height: 1080 };
};

// Helper function to get video/audio duration (simplified - in production, use ffprobe or similar)
const getMediaDuration = async (filePath: string): Promise<number> => {
  // This is a placeholder - in production, use ffprobe to get actual duration
  return 120; // 2 minutes placeholder
};

export const uploadImageAsset = async (req: Request, res: Response) => {
  let tempFilePath: string | null = null;

  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { description, tags, isPublic, altText }: CreateImageAssetDto =
      req.body;
    const file = req.file;
    tempFilePath = file.path;

    // Get image dimensions from temporary file
    const { width, height } = await getImageDimensions(tempFilePath);

    // Generate S3 key and upload to S3
    const s3Key = s3Service.generateKey(userId, 'image', file.originalname);
    const s3Url = await s3Service.uploadFile(
      tempFilePath,
      s3Key,
      file.mimetype,
      {
        originalName: file.originalname,
        uploadedBy: userId,
        assetType: 'image',
      }
    );

    // Extract format from mimetype
    const format = file.mimetype.split('/')[1] as any;

    const imageAsset = new ImageAsset({
      filename: s3Key, // Store S3 key as filename
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: s3Url, // Store S3 URL
      uploadedBy: userId,
      tags: tags || [],
      description,
      isPublic: isPublic || false,
      width,
      height,
      format,
      altText,
    });

    await imageAsset.save();

    // Clean up temporary file
    cleanupTempFile(tempFilePath);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Image asset uploaded successfully',
      data: imageAsset,
    });
  } catch (error) {
    // Clean up temporary file in case of error
    if (tempFilePath) {
      cleanupTempFile(tempFilePath);
    }

    console.error('Error uploading image asset:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to upload image asset',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const uploadVideoAsset = async (req: Request, res: Response) => {
  let tempFilePath: string | null = null;

  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { description, tags, isPublic, subtitles }: CreateVideoAssetDto =
      req.body;
    const file = req.file;
    tempFilePath = file.path;

    // Get video duration from temporary file
    const duration = await getMediaDuration(tempFilePath);

    // Generate S3 key and upload to S3
    const s3Key = s3Service.generateKey(userId, 'video', file.originalname);
    const s3Url = await s3Service.uploadFile(
      tempFilePath,
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

    const videoAsset = new VideoAsset({
      filename: s3Key, // Store S3 key as filename
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: s3Url, // Store S3 URL
      uploadedBy: userId,
      tags: tags || [],
      description,
      isPublic: isPublic || false,
      duration,
      format,
      subtitles,
    });

    await videoAsset.save();

    // Clean up temporary file
    cleanupTempFile(tempFilePath);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Video asset uploaded successfully',
      data: videoAsset,
    });
  } catch (error) {
    // Clean up temporary file in case of error
    if (tempFilePath) {
      cleanupTempFile(tempFilePath);
    }

    console.error('Error uploading video asset:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to upload video asset',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const uploadAudioAsset = async (req: Request, res: Response) => {
  let tempFilePath: string | null = null;

  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { description, tags, isPublic, metadata }: CreateAudioAssetDto =
      req.body;
    const file = req.file;
    tempFilePath = file.path;

    // Get audio duration from temporary file
    const duration = await getMediaDuration(tempFilePath);

    // Generate S3 key and upload to S3
    const s3Key = s3Service.generateKey(userId, 'audio', file.originalname);
    const s3Url = await s3Service.uploadFile(
      tempFilePath,
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

    const audioAsset = new AudioAsset({
      filename: s3Key, // Store S3 key as filename
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: s3Url, // Store S3 URL
      uploadedBy: userId,
      tags: tags || [],
      description,
      isPublic: isPublic || false,
      duration,
      format,
      metadata,
    });

    await audioAsset.save();

    // Clean up temporary file
    cleanupTempFile(tempFilePath);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Audio asset uploaded successfully',
      data: audioAsset,
    });
  } catch (error) {
    // Clean up temporary file in case of error
    if (tempFilePath) {
      cleanupTempFile(tempFilePath);
    }

    console.error('Error uploading audio asset:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to upload audio asset',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const uploadMultipleImageAssets = async (
  req: Request,
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

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { description, tags, isPublic, altText }: CreateImageAssetDto =
      req.body;
    const files = req.files as Express.Multer.File[];

    // Store temp file paths for cleanup
    tempFilePaths.push(...files.map((file) => file.path));

    const uploadedAssets = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Get image dimensions from temporary file
        const { width, height } = await getImageDimensions(file.path);

        // Generate S3 key and upload to S3
        const s3Key = s3Service.generateKey(userId, 'image', file.originalname);
        const s3Url = await s3Service.uploadFile(
          file.path,
          s3Key,
          file.mimetype,
          {
            originalName: file.originalname,
            uploadedBy: userId,
            assetType: 'image',
          }
        );

        // Extract format from mimetype
        const format = file.mimetype.split('/')[1] as any;

        const imageAsset = new ImageAsset({
          filename: s3Key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: s3Url,
          uploadedBy: userId,
          tags: tags || [],
          description,
          isPublic: isPublic || false,
          width,
          height,
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
  req: Request,
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

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { description, tags, isPublic, subtitles }: CreateVideoAssetDto =
      req.body;
    const files = req.files as Express.Multer.File[];

    // Store temp file paths for cleanup
    tempFilePaths.push(...files.map((file) => file.path));

    const uploadedAssets = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Get video duration from temporary file
        const duration = await getMediaDuration(file.path);

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

        const videoAsset = new VideoAsset({
          filename: s3Key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: s3Url,
          uploadedBy: userId,
          tags: tags || [],
          description,
          isPublic: isPublic || false,
          duration,
          format,
          subtitles,
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
  req: Request,
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

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { description, tags, isPublic, metadata }: CreateAudioAssetDto =
      req.body;
    const files = req.files as Express.Multer.File[];

    // Store temp file paths for cleanup
    tempFilePaths.push(...files.map((file) => file.path));

    const uploadedAssets = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Get audio duration from temporary file
        const duration = await getMediaDuration(file.path);

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

        const audioAsset = new AudioAsset({
          filename: s3Key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: s3Url,
          uploadedBy: userId,
          tags: tags || [],
          description,
          isPublic: isPublic || false,
          duration,
          format,
          metadata,
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
    const { page = 1, limit = 10, tags, isPublic } = req.query;

    const query: any = {};

    // Filter by asset type
    const assetTypeMap: { [key: string]: string } = {
      image: 'ImageAsset',
      video: 'VideoAsset',
      audio: 'AudioAsset',
    };

    if (type && assetTypeMap[type]) {
      query.assetType = assetTypeMap[type];
    } else {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid asset type. Must be image, video, or audio',
      });
    }

    // Additional filters
    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const assets = await ImageAsset.find(query)
      .populate('uploadedBy', 'email')
      .sort({ createDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ImageAsset.countDocuments(query);

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

// Get asset by ID
export const getAssetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const asset = await ImageAsset.findById(id).populate('uploadedBy', 'email');

    if (!asset) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: asset,
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

// Delete asset - now deletes from S3 as well
export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const asset = await ImageAsset.findById(id);

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
    const s3Key = s3Service.extractKeyFromUrl(asset.url);
    await s3Service.deleteFile(s3Key);

    // Delete from database
    await ImageAsset.findByIdAndDelete(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Asset deleted successfully',
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
