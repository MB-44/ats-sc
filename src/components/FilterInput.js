'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function FilterInput({ onFiltersChange, isLoading }) {
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [filters, setFilters] = useState([]);

  const addFilter = () => {
    const f = field.trim();
    const v = value.trim();
    if (!f || !v) return;
    const updated = [...filters, { field: f, value: v }];
    setFilters(updated);
    onFiltersChange(updated);
    setField('');
    setValue('');
  };

  const removeFilter = (index) => {
    const updated = filters.filter((_, i) => i !== index);
    setFilters(updated);
    onFiltersChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Filter name"
          value={field}
          onChange={e => setField(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none"
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Filter value"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={addFilter}
          disabled={isLoading || !field.trim() || !value.trim()}
          className={`px-3 py-2 rounded-md ${isLoading || !field.trim() || !value.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((f, i) => (
            <span key={i} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {f.field}: {f.value}
              <button onClick={() => removeFilter(i)} className="ml-1 text-blue-600 hover:text-blue-800" disabled={isLoading}>
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
