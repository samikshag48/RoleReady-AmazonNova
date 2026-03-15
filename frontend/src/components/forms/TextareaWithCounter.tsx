import React, { forwardRef } from 'react';

interface TextareaWithCounterProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCounter?: boolean;
}

export const TextareaWithCounter = forwardRef<HTMLTextAreaElement, TextareaWithCounterProps>(({
  label,
  error,
  helperText,
  maxLength,
  showCounter = true,
  className = '',
  value = '',
  ...props
}, ref) => {
  const inputId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const currentLength = String(value).length;

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between items-center">
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {showCounter && maxLength && (
            <span className={`text-xs ${currentLength > maxLength ? 'text-red-500' : 'text-slate-400'}`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <textarea
        ref={ref}
        id={inputId}
        className={`
          w-full px-3 py-2 border border-slate-300 rounded-md resize-vertical
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-slate-50 disabled:text-slate-500
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});