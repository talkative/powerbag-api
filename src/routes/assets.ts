import { Router } from 'express';
import {
  upload,
  uploadImageAsset,
  uploadVideoAsset,
  uploadAudioAsset,
  uploadMultipleImageAssets,
  uploadMultipleVideoAssets,
  uploadMultipleAudioAssets,
  getAssetsByType,
  getAssetById,
  deleteAsset,
} from '../handlers/assets';

const router = Router();

// Single file upload routes
router.post('/image/upload', upload.single('file'), uploadImageAsset);
router.post('/video/upload', upload.single('file'), uploadVideoAsset);
router.post('/audio/upload', upload.single('file'), uploadAudioAsset);

// Multiple file upload routes
router.post(
  '/image/upload/multiple',
  upload.array('files', 10),
  uploadMultipleImageAssets
);
router.post(
  '/video/upload/multiple',
  upload.array('files', 5),
  uploadMultipleVideoAssets
);
router.post(
  '/audio/upload/multiple',
  upload.array('files', 10),
  uploadMultipleAudioAssets
);

// Get routes
router.get('/:type', getAssetsByType); // Get assets by type (image/video/audio)
router.get('/detail/:id', getAssetById); // Get specific asset by ID

// Delete route
router.delete('/:id', deleteAsset);

export default router;
