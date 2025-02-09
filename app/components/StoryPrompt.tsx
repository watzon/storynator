'use client';

import { useState } from 'react';
import { GenerationOptions } from '../types/story';

type StoryPromptProps = {
  onGenerate: (prompt: string, options: GenerationOptions) => void;
  isGenerating: boolean;
};

export default function StoryPrompt({ onGenerate, isGenerating }: StoryPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<GenerationOptions>({
    pageCount: 5,
    ageRange: '5-8',
    includeImages: true,
    theme: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, options);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <textarea
            className="w-full h-32 p-4 text-lg border rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
            placeholder="What would you like to write a story about?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
          >
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Story'}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-6 p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
            <div>
              <label className="block text-base font-medium text-gray-200 mb-2">
                Page Count
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={options.pageCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setOptions({ 
                      ...options, 
                      pageCount: isNaN(value) ? 1 : Math.max(1, Math.min(20, value)) 
                    });
                  }}
                  className="block w-full rounded-xl bg-gray-700/50 border-gray-600 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-4 pr-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400">pages</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-200 mb-2">
                Age Range
              </label>
              <select
                value={options.ageRange}
                onChange={(e) => setOptions({ ...options, ageRange: e.target.value })}
                className="block w-full rounded-xl bg-gray-700/50 border-gray-600 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-4 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                }}
              >
                <option value="3-5">3-5 years</option>
                <option value="5-8">5-8 years</option>
                <option value="8-12">8-12 years</option>
                <option value="12+">12+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-200 mb-2">
                Theme
              </label>
              <input
                type="text"
                value={options.theme || ''}
                onChange={(e) => setOptions({ ...options, theme: e.target.value })}
                placeholder="e.g., Adventure, Fantasy, Educational"
                className="block w-full rounded-xl bg-gray-700/50 border-gray-600 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-4 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative flex items-start">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id="includeImages"
                    checked={options.includeImages}
                    onChange={(e) => setOptions({ ...options, includeImages: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-800 bg-gray-700/50"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="includeImages" className="font-medium text-gray-200">
                    Include Images
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 