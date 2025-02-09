'use client';

import { useState, useEffect } from 'react';
import { Story } from '../types/story';
import { useSwipeable } from 'react-swipeable';

type StoryViewerProps = {
  story: Story;
  onClose: () => void;
};

export default function StoryViewer({ story, onClose }: StoryViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Preload images function
  const preloadImages = (imageUrls: string[]) => {
    imageUrls.forEach(url => {
      if (!loadedImages.has(url)) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, url]));
        };
        img.src = url;
      }
    });
  };

  // Preload adjacent images when current page changes
  useEffect(() => {
    if (!story.metadata.includeImages) return;

    const imagesToPreload = [];
    // Preload next image
    if (currentPage < story.pages.length - 1 && story.pages[currentPage + 1].imageUrl) {
      imagesToPreload.push(story.pages[currentPage + 1].imageUrl!);
    }
    // Preload previous image
    if (currentPage > 0 && story.pages[currentPage - 1].imageUrl) {
      imagesToPreload.push(story.pages[currentPage - 1].imageUrl!);
    }
    preloadImages(imagesToPreload);
  }, [currentPage, story.pages, story.metadata.includeImages]);

  // Preload first few images on mount
  useEffect(() => {
    if (!story.metadata.includeImages) return;

    const initialImagesToPreload = story.pages
      .slice(0, Math.min(3, story.pages.length))
      .map(page => page.imageUrl)
      .filter((url): url is string => !!url);

    preloadImages(initialImagesToPreload);
  }, [story.pages, story.metadata.includeImages]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentPage < story.pages.length - 1) {
        setCurrentPage(currentPage + 1);
      }
    },
    onSwipedRight: () => {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    },
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' && currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (e.key === 'ArrowLeft' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header - now semi-transparent and minimal */}
      <div className="absolute top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{story.title}</h1>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Story Content with Navigation Overlays */}
      <div
        {...handlers}
        className="flex-1 relative flex items-stretch justify-center overflow-hidden"
      >
        {/* Left Navigation Area */}
        {currentPage > 0 && (
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="absolute left-0 top-16 bottom-0 w-16 md:w-24 z-10 flex items-center justify-start px-4 opacity-0 hover:opacity-100 transition-opacity group"
            aria-label="Previous page"
          >
            <div className="p-3 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm group-hover:bg-black/20 dark:group-hover:bg-white/20 transition-colors">
              <svg
                className="w-5 h-5 text-white dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
          </button>
        )}

        {/* Right Navigation Area */}
        {currentPage < story.pages.length - 1 && (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="absolute right-0 top-16 bottom-0 w-16 md:w-24 z-10 flex items-center justify-end px-4 opacity-0 hover:opacity-100 transition-opacity group"
            aria-label="Next page"
          >
            <div className="p-3 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm group-hover:bg-black/20 dark:group-hover:bg-white/20 transition-colors">
              <svg
                className="w-5 h-5 text-white dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        )}

        {/* Content Area */}
        <div className="w-full max-w-7xl h-full p-4 pt-16 flex flex-col md:flex-row items-center gap-8">
          {/* Image */}
          {story.pages[currentPage].imageUrl && story.metadata.includeImages && (
            <div className="w-full md:w-1/2 h-[40vh] md:h-[80vh] relative">
              <img
                src={story.pages[currentPage].imageUrl}
                alt={`Illustration for page ${currentPage + 1}`}
                className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${
                  loadedImages.has(story.pages[currentPage].imageUrl!) ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          )}

          {/* Text */}
          <div 
            className={`w-full ${
              story.metadata.includeImages ? 'md:w-1/2' : 'md:w-2/3'
            } h-[40vh] md:h-[80vh] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-8 overflow-y-auto flex flex-col`}
          >
            <div className="flex-1 prose prose-lg dark:prose-invert">
              {story.pages[currentPage].content}
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Page {currentPage + 1} of {story.pages.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 