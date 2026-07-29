/**
 * HeroSection Component
 *
 * Premium hero section inspired by Urban Company:
 * - "Home services at your doorstep" heading on the left
 * - Image grid on the right
 * - Responsive layout, tighter center content.
 */
import { motion } from 'framer-motion';

const HeroSection = ({ children }) => {
    return (
        <section className="bg-white flex flex-col items-center justify-center min-h-screen overflow-hidden">
            <div className="main-container text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8">
                        Home services<br />
                        at your <span className="text-teal-600 block sm:inline sm:ml-4">doorstep</span>
                    </h1>
                    <div className="w-24 h-1.5 bg-teal-600 mx-auto rounded-full mb-8 opacity-20" />
                </motion.div>
                
                {/* Children (Category Grid) centered below */}
                {children && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                        className="max-w-4xl mx-auto"
                    >
                        {children}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default HeroSection;
