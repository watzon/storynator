'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AIServiceConfig } from '../types/story';

type AIServicesContextType = {
  config: AIServiceConfig | null;
  setConfig: (config: AIServiceConfig) => void;
  isConfigured: boolean;
};

const AIServicesContext = createContext<AIServicesContextType | undefined>(undefined);

const DEFAULT_CONFIG: AIServiceConfig = {
  textService: {
    service: 'openai',
    apiKey: '',
  },
  imageService: {
    service: 'openai',
    apiKey: '',
  },
};

export function AIServicesProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AIServiceConfig | null>(null);

  useEffect(() => {
    // Load config from localStorage on mount
    const stored = localStorage.getItem('ai_config');
    if (stored) {
      setConfig(JSON.parse(stored));
    }
  }, []);

  const handleSetConfig = (newConfig: AIServiceConfig) => {
    setConfig(newConfig);
    localStorage.setItem('ai_config', JSON.stringify(newConfig));
  };

  const isConfigured = Boolean(
    config?.textService.apiKey && config?.imageService.apiKey
  );

  return (
    <AIServicesContext.Provider 
      value={{ 
        config, 
        setConfig: handleSetConfig,
        isConfigured 
      }}
    >
      {children}
    </AIServicesContext.Provider>
  );
}

export function useAIServices() {
  const context = useContext(AIServicesContext);
  if (context === undefined) {
    throw new Error('useAIServices must be used within an AIServicesProvider');
  }
  return context;
} 