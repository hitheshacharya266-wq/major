/**
 * ServiceCard Component
 *
 * Displays a service provider's info in a glassmorphism card.
 */
import StarRating from './StarRating';
import { SERVICE_CATEGORIES } from '../utils/helpers';

const ServiceCard = ({ provider, onBook }) => {
    const category = SERVICE_CATEGORIES.find(c => c.id === provider.category);

    return (
        <div className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            {/* Category header */}
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 flex items-center gap-2">
                <span className="text-2xl">{category?.emoji || '🛠️'}</span>
                <span className="text-white font-semibold text-sm uppercase tracking-wide">
                    {category?.label || provider.category}
                </span>
            </div>

            <div className="p-5 space-y-3">
                {/* Name */}
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {provider.name}
                </h3>

                {/* Description */}
                {provider.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">{provider.description}</p>
                )}

                {/* Rating */}
                <StarRating rating={provider.rating || 0} readOnly size="sm" />

                {/* Availability + Book */}
                <div className="flex items-center justify-between pt-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${provider.available
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                        {provider.available ? '● Available' : '● Unavailable'}
                    </span>

                    {provider.available && onBook && (
                        <button
                            onClick={() => onBook(provider)}
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
                        >
                            Book Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
