/**
 * PageTransition Component
 *
 * Wraps page content with Framer Motion fade + slide animation.
 * Use this around every page component for smooth route transitions.
 */
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 12,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
};

const PageTransition = ({ children }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full flex-1 flex flex-col items-center"
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
