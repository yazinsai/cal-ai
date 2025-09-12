'use client';

import { useState, useEffect } from 'react';
import { setApiKey, getApiKey, clearApiKey, validateApiKey } from '@/lib/ai';
import { Key, Eye, EyeOff, Check, X, Loader2, Trash2 } from 'lucide-react';

interface ApiKeyInputProps {
  onKeyValidated?: (isValid: boolean) => void;
}

export function ApiKeyInput({ onKeyValidated }: ApiKeyInputProps) {
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const existingKey = getApiKey();
    if (existingKey) {
      setApiKeyValue(existingKey);
      setHasKey(true);
      setIsValid(true);
    }
  }, []);

  const handleValidate = async () => {
    if (!apiKeyValue.trim()) return;
    
    setIsValidating(true);
    const valid = await validateApiKey(apiKeyValue);
    setIsValid(valid);
    
    if (valid) {
      setApiKey(apiKeyValue);
      setHasKey(true);
      if (onKeyValidated) {
        onKeyValidated(true);
      }
    }
    
    setIsValidating(false);
  };

  const handleClear = () => {
    clearApiKey();
    setApiKeyValue('');
    setIsValid(null);
    setHasKey(false);
    if (onKeyValidated) {
      onKeyValidated(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <Key className="w-6 h-6 mr-2 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">OpenAI API Key</h2>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Your API key is stored locally and never sent to any server. Get your key from{' '}
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          OpenAI Platform
        </a>
      </p>

      <div className="space-y-4">
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKeyValue}
            onChange={(e) => {
              setApiKeyValue(e.target.value);
              setIsValid(null);
            }}
            placeholder="sk-..."
            className="w-full px-3 py-2 pr-24 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isValid === true && (
              <Check className="w-5 h-5 text-green-500" />
            )}
            {isValid === false && (
              <X className="w-5 h-5 text-red-500" />
            )}
            
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              type="button"
            >
              {showKey ? (
                <EyeOff className="w-5 h-5 text-gray-500" />
              ) : (
                <Eye className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleValidate}
            disabled={!apiKeyValue.trim() || isValidating}
            className="flex-1 flex items-center justify-center py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Validate & Save
              </>
            )}
          </button>

          {hasKey && (
            <button
              onClick={handleClear}
              className="flex items-center justify-center py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </button>
          )}
        </div>

        {isValid === false && (
          <p className="text-sm text-red-500">
            Invalid API key. Please check and try again.
          </p>
        )}

        {isValid === true && (
          <p className="text-sm text-green-500">
            ✓ API key validated and saved successfully!
          </p>
        )}
      </div>
    </div>
  );
}