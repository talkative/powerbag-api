export interface CreateStorylineDto {
  title: string;
  collectionId: string;
  bags?: {
    firstColumn?: Array<{
      id: string;
      imageUrl: string;
      videoUrl?: string;
      imageFrameUrls?: string[];
    }>;
    secondColumn?: Array<{
      id: string;
      imageUrl: string;
      videoUrl?: string;
      imageFrameUrls?: string[];
    }>;
    thirdColumn?: Array<{
      id: string;
      imageUrl: string;
      videoUrl?: string;
      imageFrameUrls?: string[];
    }>;
  };
  stories?: Array<{
    id: string;
    audioSrc: string;
    selectedBags: string[];
    events: Array<{
      start: number;
      stop: number;
      action: string;
      bags: string[];
    }>;
  }>;
}

export interface UpdateStorylineDto {
  title?: string;
  bags?: {
    firstColumn?: Array<{
      id: string;
      imageUrl: string;
      videoUrl?: string;
      imageFrameUrls?: string[];
    }>;
    secondColumn?: Array<{
      id: string;
      imageUrl: string;
      videoUrl?: string;
      imageFrameUrls?: string[];
    }>;
    thirdColumn?: Array<{
      id: string;
      imageUrl: string;
      videoUrl?: string;
      imageFrameUrls?: string[];
    }>;
  };
  stories?: Array<{
    id: string;
    audioSrc: string;
    selectedBags: string[];
    events: Array<{
      start: number;
      stop: number;
      action: string;
      bags: string[];
    }>;
  }>;
  collections?: string[];
}
