import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
}

export function TagInput({ 
  label, 
  tags, 
  onChange, 
  placeholder = 'Type and press Enter...',
  maxTags,
  suggestions = []
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && (!maxTags || tags.length < maxTags)) {
      onChange([...tags, tag]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      
      <div className="relative">
        <div className="min-h-[42px] p-2 border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <div className="flex flex-wrap gap-1 mb-1">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="hover:text-blue-600"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="w-full outline-none bg-transparent"
            disabled={maxTags ? tags.length >= maxTags : false}
          />
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}