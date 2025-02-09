'use client';

import { useState, useEffect } from 'react';
import { Story, GenerationOptions } from '../types/story';
import { useAIServices } from '../contexts/AIServicesContext';
import { useAIStoryGenerator, GenerationStage } from '../hooks/useAIStoryGenerator';
import StoryPrompt from './StoryPrompt';
import LoadingScreen from './LoadingScreen';
import StoryViewer from './StoryViewer';
import SettingsModal from './SettingsModal';
import { formatDate } from '../lib/utils';

export default function HomeContent() {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingStage, setLoadingStage] = useState<GenerationStage>('story');
  const { isConfigured } = useAIServices();
  const { generateStory, isGenerating, error } = useAIStoryGenerator();

  useEffect(() => {
    // Load stories from localStorage
    const savedStories = localStorage.getItem('stories');
    if (savedStories) {
      setStories(JSON.parse(savedStories));
    }
  }, []);

  const handleGenerate = async (prompt: string, options: GenerationOptions) => {
    if (!isConfigured) {
      setShowSettings(true);
      return;
    }

    try {
      const story = await generateStory(prompt, options, {
        onStageChange: (stage) => setLoadingStage(stage)
      });
      
      if (story) {
        // Save to localStorage
        const updatedStories = [story, ...stories];
        localStorage.setItem('stories', JSON.stringify(updatedStories));
        setStories(updatedStories);
        setCurrentStory(story);
      }
    } catch (err) {
      console.error('Error generating story:', err);
      alert(error || 'An error occurred while generating the story. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 relative overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Stories</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => setCurrentStory(story)}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{story.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Created: {formatDate(story.metadata.createdAt)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {story.pages.length} pages • Age: {story.metadata.ageRange}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between bg-white dark:bg-gray-800">
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">The Storynator</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <StoryPrompt onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      {isGenerating && <LoadingScreen stage={loadingStage} />}
      {currentStory && (
        <StoryViewer
          story={currentStory}
          onClose={() => setCurrentStory(null)}
        />
      )}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
} 