import { ImageAsset, AudioAsset } from '../models/Asset';

export const createEmbeddedImageAsset = async (assetId: string) => {
  const imageAsset = await ImageAsset.findById(assetId);
  if (!imageAsset) return null;

  return {
    assetId: imageAsset._id.toString(),
    originalName: imageAsset.originalName,
    url: imageAsset.url,
    format: imageAsset.format,
  };
};

export const createEmbeddedAudioAsset = async (assetId: string) => {
  const audioAsset = await AudioAsset.findById(assetId);
  if (!audioAsset) return null;

  return {
    assetId: audioAsset._id.toString(),
    originalName: audioAsset.originalName,
    url: audioAsset.url,
    format: audioAsset.format,
  };
};
