'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';

export default function KeywordInput({ onKeywordsChange, isLoading }) {
  const [inputValue, setInputValue] = useState('');
  const [keywords, setKeywords] = useState([]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      addKeyword();
    }
  };

  const addKeyword = () => {
    const newKeyword = inputValue.trim().toLowerCase();
    if (newKeyword && !keywords.includes(newKeyword)) {
      const updatedKeywords = [...keywords, newKeyword];
      setKeywords(updatedKeywords);
      onKeywordsChange(updatedKeywords);
      setInputValue('');
    }
  };

  const removeKeyword = (index) => {
    const updatedKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(updatedKeywords);
    onKeywordsChange(updatedKeywords);
  };

  return (
    <div>
      <div className="flex">
        <div className="relative flex-grow">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type keyword and press Enter"
            className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          {inputValue && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setInputValue('')}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <button
          onClick={addKeyword}
          disabled={!inputValue.trim() || isLoading}
          className={`px-4 py-2 rounded-r-md ${
            !inputValue.trim() || isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <div
              key={index}
              className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(index)}
                className="ml-1 text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}