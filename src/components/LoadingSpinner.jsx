/**
 * LoadingSpinner Component
 *
 * Reusable animated spinner with multiple size variants.
 * Props:
 *  - size: "sm" | "md" | "lg" (default "md")
 *  - fullScreen: boolean — centers in viewport if true
 *  - text: optional loading message
 */
const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
};

const LoadingSpinner = ({ size = 'md', fullScreen = false, text }) => {
    const spinner = (
        <div className="flex flex-col items-center gap-4 transition-all duration-500 animate-slide-up">
            <div className={`relative ${sizeMap[size] || sizeMap.md}`}>
                <div className={`absolute inset-0 spinner-ring ${sizeMap[size] || sizeMap.md}`} />
                <div className={`absolute inset-0 border-t-teal-600 rounded-full animate-spin ${sizeMap[size] || sizeMap.md}`} style={{ borderTopWidth: 'inherit' }} />
            </div>
            {text && (
                <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 backdrop-blur-sm fixed inset-0 z-[9999]">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
