import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  maxRating?: number;
  size?: number;
  className?: string;
}

export function RatingStars({ 
  rating, 
  onChange, 
  readonly = false, 
  maxRating = 5, 
  size = 20,
  className = ''
}: RatingStarsProps) {
  const handleClick = (newRating: number) => {
    if (!readonly && onChange) {
      onChange(newRating);
    }
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              transition-transform duration-150
              ${!readonly && 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded'}
            `}
            disabled={readonly}
          >
            <Star
              size={size}
              className={`
                ${isFilled ? 'text-yellow-400 fill-current' : 'text-slate-300'}
                ${!readonly && 'hover:text-yellow-300'}
                transition-colors duration-150
              `}
            />
          </button>
        );
      })}
    </div>
  );
}