/**
 * ServiceCategoryCard Component
 *
 * Premium category card with icon, label, and hover effects.
 * Inspired by Urban Company's service grid.
 */
import { motion } from 'framer-motion';

const ServiceCategoryCard = ({ icon: Icon, label, color, bgColor, onClick, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
            onClick={onClick}
            className="category-card group"
            role="button"
            tabIndex={0}
            aria-label={`Browse ${label} services`}
        >
            <div
                className="icon-container"
                style={{ backgroundColor: bgColor || '#f0fdf4' }}
            >
                <Icon
                    className="w-8 h-8 transition-colors duration-300"
                    style={{ color: color || '#0d9488' }}
                />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center leading-tight group-hover:text-gray-900 transition-colors">
                {label}
            </span>
        </motion.div>
    );
};

export default ServiceCategoryCard;
