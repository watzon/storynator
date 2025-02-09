'use client';

import { useState, useEffect } from 'react';

type LoadingStage = 'story' | 'images';

type LoadingScreenProps = {
  stage: LoadingStage;
};

const LOADING_MESSAGES = {
  story: [
    "Crafting a fantastical story...",
    "Brewing up some imagination...",
    "Weaving tales of wonder...",
    "Sprinkling in some magic...",
    "Gathering inspiration...",
    "Writing the perfect beginning...",
    "Adding a dash of excitement...",
    "Creating memorable characters...",
  ],
  images: [
    "Coloring in the lines...",
    "Painting magical scenes...",
    "Bringing characters to life...",
    "Adding the finishing touches...",
    "Making everything beautiful...",
    "Mixing the perfect colors...",
    "Sketching wonderful illustrations...",
    "Adding sparkle to the scenes...",
  ],
};

export default function LoadingScreen({ stage }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = LOADING_MESSAGES[stage];

  useEffect(() => {
    // Reset message index when stage changes
    setMessageIndex(0);

    // Rotate through messages every 5 seconds
    const interval = setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [stage, messages.length]);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 flex flex-col items-center justify-center z-50">
      <div className="w-24 h-24 relative">
        <div className="absolute inset-0">
          <div className="w-full h-full border-8 border-indigo-200 dark:border-indigo-900 rounded-lg animate-[spin_3s_linear_infinite]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-indigo-600 dark:text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      </div>
      <div className="mt-4 text-lg font-medium text-indigo-600 dark:text-indigo-400 min-h-[2rem] text-center transition-opacity duration-500">
        {messages[messageIndex]}
      </div>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md text-center px-4">
        {stage === 'story' ? 
          "Our AI is carefully crafting each page of your story." :
          "Creating beautiful illustrations for your story."
        }
      </div>
    </div>
  );
} 