'use client';

import { useState, useCallback } from 'react';
import { AIServiceManager } from '../lib/ai-services';
import { useAIServices } from '../contexts/AIServicesContext';
import { GenerationOptions, Story } from '../types/story';

export type GenerationStage = 'story' | 'images';

export type GenerationEvents = {
  onStageChange?: (stage: GenerationStage) => void;
};

export function useAIStoryGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config, isConfigured } = useAIServices();

  const generateStory = useCallback(async (
    prompt: string, 
    options: GenerationOptions,
    events?: GenerationEvents
  ): Promise<Story | null> => {
    if (!isConfigured || !config) {
      setError('AI services not configured. Please set up your API keys.');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const aiManager = new AIServiceManager(config);
      events?.onStageChange?.('story');
      const story = await aiManager.generateStory(prompt, options);
      
      if (options.includeImages) {
        events?.onStageChange?.('images');
      }
      
      return story;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the story');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [config, isConfigured]);

  return {
    generateStory,
    isGenerating,
    error,
  };
} 