'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '@/utils/helpers';

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');

  // Debounced search handler
  const debouncedSearch = debounce((searchTerm) => {
    onSearch(searchTerm);
  }, 300);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search by filename or content..."
        value={query}
        onChange={handleChange}
        disabled={isLoading}
      />
      {query && (
        <button
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          onClick={clearSearch}
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}