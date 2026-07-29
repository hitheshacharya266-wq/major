/**
 * StarRating Component
 * 
 * Clickable or read-only star rating display.
 */
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRate, size = 'md', readOnly = false }) => {
    const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
    const starSize = sizeMap[size] || sizeMap.md;

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && onRate && onRate(star)}
                    className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                >
                    <Star
                        className={`${starSize} ${star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-300'
                            }`}
                    />
                </button>
            ))}
            {rating > 0 && (
                <span className="ml-1 text-sm text-slate-500 font-medium">
                    {typeof rating === 'number' ? rating.toFixed(1) : rating}
                </span>
            )}
        </div>
    );
};

export default StarRating;
