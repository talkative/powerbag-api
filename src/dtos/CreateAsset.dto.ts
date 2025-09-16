export interface CreateAssetDto {
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface CreateImageAssetDto extends CreateAssetDto {
  altText?: string;
}

export interface CreateVideoAssetDto extends CreateAssetDto {
  subtitles?: Array<{
    language: string;
    url: string;
  }>;
}

export interface CreateAudioAssetDto extends CreateAssetDto {
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: number;
  };
}
