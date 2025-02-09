export type StoryMetadata = {
  ageRange?: string;
  pageCount?: number;
  theme?: string;
  includeImages?: boolean;
  createdAt: string;
};

export type StoryPage = {
  content: string;
  image?: string;
  imageUrl?: string;
};

export type Story = {
  id: string;
  title: string;
  metadata: StoryMetadata;
  pages: StoryPage[];
};

export type GenerationOptions = {
  pageCount: number;
  ageRange: string;
  includeImages: boolean;
  theme?: string;
};

export type AIService = 'openai' | 'anthropic' | 'stability' | 'google' | 'replicate';

export type AIServiceConfig = {
  textService: {
    service: AIService;
    apiKey: string;
  };
  imageService: {
    service: AIService;
    apiKey: string;
  };
}; 