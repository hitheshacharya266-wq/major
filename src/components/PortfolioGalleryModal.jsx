import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const PortfolioGalleryModal = ({
    isOpen,
    onClose,
    images = [],
    providerName = 'Provider'
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!isOpen) return null;

    const currentImg = images[selectedIndex];
    const currentUrl = typeof currentImg === 'object' ? currentImg.url : currentImg;
    const currentTitle = typeof currentImg === 'object' ? currentImg.title || currentImg.name : `Work Photo ${selectedIndex + 1}`;

    const handlePrev = (e) => {
        e.stopPropagation();
        setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setSelectedIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-surface-container-lowest rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-surface border-b border-outline-variant/20 z-10">
                        <div className="flex items-center gap-2 min-w-0">
                            <ImageIcon className="w-5 h-5 text-primary shrink-0" />
                            <div className="min-w-0">
                                <h3 className="text-sm sm:text-base font-extrabold text-on-surface truncate">
                                    {providerName}'s Work Portfolio
                                </h3>
                                <p className="text-[11px] text-on-surface-variant font-medium">
                                    Photo {selectedIndex + 1} of {images.length}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer transition-colors shrink-0"
                            title="Close Gallery"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Main Focused Image with Navigation Buttons */}
                    <div className="relative flex-1 bg-black flex items-center justify-center min-h-[260px] max-h-[60vh] sm:max-h-[68vh] overflow-hidden select-none">
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={currentUrl}
                                    alt={currentTitle}
                                    className="max-w-full max-h-[60vh] sm:max-h-[68vh] object-contain transition-all duration-200"
                                />

                                {images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handlePrev}
                                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                                            title="Previous Image"
                                        >
                                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                                            title="Next Image"
                                        >
                                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="text-white/60 text-xs py-12">No images to display.</div>
                        )}
                    </div>

                    {/* Image Caption & Thumbnails Ribbon */}
                    <div className="p-3 sm:p-4 bg-surface border-t border-outline-variant/20 space-y-2.5">
                        <p className="text-xs sm:text-sm font-bold text-on-surface text-center truncate px-2">
                            {currentTitle}
                        </p>

                        {images.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full justify-center scrollbar-none">
                                {images.map((img, idx) => {
                                    const thumbUrl = typeof img === 'object' ? img.url : img;
                                    const isSel = idx === selectedIndex;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedIndex(idx)}
                                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                                isSel ? 'border-primary scale-105 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={thumbUrl}
                                                alt="thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
            </div>
        </div>
    );
};

export default PortfolioGalleryModal;
