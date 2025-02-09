'use client';

import { useState } from 'react';
import { useAIServices } from '../contexts/AIServicesContext';
import { AIService, AIServiceConfig } from '../types/story';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SERVICES: { value: AIService; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'stability', label: 'Stability AI' },
  { value: 'google', label: 'Google AI' },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { config, setConfig } = useAIServices();
  const [formData, setFormData] = useState<AIServiceConfig>(config || {
    textService: { service: 'openai', apiKey: '' },
    imageService: { service: 'openai', apiKey: '' },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig(formData);
    onClose();
  };

  const handleServiceChange = (type: 'textService' | 'imageService', field: 'service' | 'apiKey', value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-100">AI Service Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-8">
            {/* Text Generation Service */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-200">Text Generation</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Service
                </label>
                <select
                  value={formData.textService.service}
                  onChange={(e) => handleServiceChange('textService', 'service', e.target.value as AIService)}
                  className="block w-full rounded-xl bg-gray-700/50 border-gray-600 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-4 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  {SERVICES.filter(s => s.value !== 'stability').map(service => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.textService.apiKey}
                  onChange={(e) => handleServiceChange('textService', 'apiKey', e.target.value)}
                  className="block w-full rounded-xl bg-gray-700/50 border-gray-600 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-4 placeholder-gray-400"
                  placeholder="Enter API key..."
                />
              </div>
            </div>

            {/* Image Generation Service */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-200">Image Generation</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Service
                </label>
                <select
                  value={formData.imageService.service}
                  onChange={(e) => handleServiceChange('imageService', 'service', e.target.value as AIService)}
                  className="block w-full rounded-xl bg-gray-700/50 border-gray-600 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-4 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  {SERVICES.filter(s => s.value !== 'anthropic').map(service => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.imageService.apiKey}
                  onChange={(e) => handleServiceChange('imageService', 'apiKey', e.target.value)}
                  className="block w-full rounded-xl bg-gray-700/50 border-gray-600 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-4 placeholder-gray-400"
                  placeholder="Enter API key..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 