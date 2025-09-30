import { Router } from 'express';
import {
  upload,
  uploadMultipleImageAssets,
  uploadMultipleVideoAssets,
  uploadMultipleAudioAssets,
  getAssetsByType,
  getAssetById,
  deleteAsset,
  deleteAllAssets,
} from '../handlers/assets';

const router = Router();

// Multiple file upload routes
router.post('/image/upload', upload.array('files'), uploadMultipleImageAssets);
router.post(
  '/video/upload',
  upload.array('files', 5),
  uploadMultipleVideoAssets
);
router.post(
  '/audio/upload',
  upload.array('files', 10),
  uploadMultipleAudioAssets
);

// Get routes
router.get('/:type', getAssetsByType); // Get assets by type (image/video/audio)
router.get('/detail/:id', getAssetById); // Get specific asset by ID

// Delete route
router.delete('/:id', deleteAsset);
router.delete('/', deleteAllAssets);

export default router;
