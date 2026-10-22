import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    uploadProviderPortfolioImage,
    deleteStorageFile,
    updateProviderPortfolio
} from '../firebase/firestoreService';
import {
    ALLOWED_IMAGE_TYPES,
    MAX_FILE_SIZE_BYTES,
    MAX_PORTFOLIO_IMAGES,
    isCloudinaryConfigured
} from '../services/cloudinaryService';
import {
    Upload,
    Image as ImageIcon,
    Trash2,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = ALLOWED_IMAGE_TYPES;

/**
 * PortfolioManager component for providers to upload, preview, replace, and delete portfolio images.
 */
const PortfolioManager = ({
    providerId,
    initialPortfolio = [],
    onPortfolioUpdated,
    onClose
}) => {
    const { currentUser } = useAuth();
    const fileInputRef = useRef(null);

    // Existing images already saved in Firestore
    const [existingImages, setExistingImages] = useState(
        Array.isArray(initialPortfolio) ? initialPortfolio : []
    );

    // Staged new images waiting to be uploaded: { file, previewUrl, title, id, sizeFormatted }
    const [stagedFiles, setStagedFiles] = useState([]);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 });
    const [dragActive, setDragActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const cloudinaryReady = isCloudinaryConfigured();

    // Ensure authorized access
    const isOwner = currentUser?.uid && currentUser.uid === providerId;

    const [prevInitial, setPrevInitial] = useState(initialPortfolio);
    if (prevInitial !== initialPortfolio) {
        setPrevInitial(initialPortfolio);
        if (Array.isArray(initialPortfolio)) {
            setExistingImages(initialPortfolio);
        }
    }

    // Cleanup local preview URLs on unmount
    useEffect(() => {
        return () => {
            stagedFiles.forEach(item => {
                if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, [stagedFiles]);

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleFileValidation = (files) => {
        setErrorMessage('');
        setSuccessMessage('');
        const validNewItems = [];
        const errors = [];

        const currentTotal = existingImages.length + stagedFiles.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (currentTotal + validNewItems.length >= MAX_PORTFOLIO_IMAGES) {
                errors.push(`Maximum ${MAX_PORTFOLIO_IMAGES} portfolio images allowed.`);
                break;
            }

            if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
                errors.push(`"${file.name}" is not a supported format. Please use JPG, JPEG, PNG, or WebP.`);
                continue;
            }

            if (file.size > MAX_FILE_SIZE_BYTES) {
                errors.push(`"${file.name}" exceeds 5MB size limit (${formatBytes(file.size)}).`);
                continue;
            }

            const previewUrl = URL.createObjectURL(file);
            validNewItems.push({
                id: `staged_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                file,
                previewUrl,
                title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '),
                sizeFormatted: formatBytes(file.size)
            });
        }

        if (errors.length > 0) {
            setErrorMessage(errors[0]);
            toast.error(errors[0]);
        }

        if (validNewItems.length > 0) {
            setStagedFiles(prev => [...prev, ...validNewItems]);
            toast.success(`${validNewItems.length} image(s) ready for preview.`);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileValidation(Array.from(e.target.files));
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileValidation(Array.from(e.dataTransfer.files));
        }
    };

    const handleRemoveStaged = (idToRemove) => {
        setStagedFiles(prev => {
            const item = prev.find(i => i.id === idToRemove);
            if (item?.previewUrl && item.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(item.previewUrl);
            }
            return prev.filter(i => i.id !== idToRemove);
        });
    };

    const handleTitleChange = (id, newTitle) => {
        setStagedFiles(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item));
    };

    const handleDeleteExisting = async (itemToDelete) => {
        if (!isOwner) {
            toast.error('You are not authorized to modify this portfolio.');
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this portfolio image?');
        if (!confirmDelete) return;

        try {
            const updated = existingImages.filter(item => {
                const itemId = typeof item === 'object' ? item.id || item.url : item;
                const targetId = typeof itemToDelete === 'object' ? itemToDelete.id || itemToDelete.url : itemToDelete;
                return itemId !== targetId;
            });

            // Update in Firestore
            await updateProviderPortfolio(providerId, updated);
            setExistingImages(updated);

            // Best-effort cleanup of Storage file
            if (typeof itemToDelete === 'object' && itemToDelete.storagePath) {
                deleteStorageFile(itemToDelete.storagePath).catch(() => {});
            }

            if (onPortfolioUpdated) {
                onPortfolioUpdated(updated);
            }

            toast.success('Portfolio image removed from your profile.');
        } catch (err) {
            console.error('Error removing portfolio image:', err);
            toast.error('Failed to remove image. Please try again.');
        }
    };

    const handleUploadAndSave = async () => {
        if (!isOwner) {
            toast.error('You are not authorized to modify this portfolio.');
            return;
        }

        if (!isCloudinaryConfigured()) {
            const missingMsg = 'Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local.';
            setErrorMessage(missingMsg);
            toast.error(missingMsg);
            return;
        }

        if (stagedFiles.length === 0) {
            toast.error('Please select at least one image to upload.');
            return;
        }

        setUploading(true);
        setErrorMessage('');
        setSuccessMessage('');
        setUploadProgress({ current: 0, total: stagedFiles.length, percent: 0 });

        const uploadedItems = [];
        const failedFiles = [];

        for (let i = 0; i < stagedFiles.length; i++) {
            const item = stagedFiles[i];
            setUploadProgress({ current: i + 1, total: stagedFiles.length, percent: 0 });

            try {
                const res = await uploadProviderPortfolioImage(providerId, item.file, (filePercent) => {
                    setUploadProgress({
                        current: i + 1,
                        total: stagedFiles.length,
                        percent: filePercent
                    });
                });

                uploadedItems.push({
                    id: res.id,
                    url: res.url,
                    publicId: res.publicId || '',
                    storagePath: res.storagePath || '',
                    title: item.title?.trim() || res.title || item.file.name,
                    fileName: item.file.name,
                    width: res.width || null,
                    height: res.height || null,
                    format: res.format || '',
                    createdAt: res.createdAt || new Date().toISOString()
                });
            } catch (uploadErr) {
                console.error(`Failed to upload ${item.file.name}:`, uploadErr);
                failedFiles.push({ file: item.file.name, error: uploadErr.message });
            }
        }

        if (uploadedItems.length > 0) {
            try {
                // Combine existing and newly uploaded images
                const combinedPortfolio = [...existingImages, ...uploadedItems];
                await updateProviderPortfolio(providerId, combinedPortfolio);
                setExistingImages(combinedPortfolio);

                // Revoke object URLs and clear staged files
                stagedFiles.forEach(item => {
                    if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(item.previewUrl);
                    }
                });
                setStagedFiles([]);

                const successMsg = `Successfully uploaded and saved ${uploadedItems.length} portfolio image(s)!`;
                setSuccessMessage(successMsg);
                toast.success(successMsg);

                if (onPortfolioUpdated) {
                    onPortfolioUpdated(combinedPortfolio);
                }
            } catch (dbErr) {
                console.error('Failed to save portfolio metadata to Firestore:', dbErr);
                const msg = 'Images were uploaded to Cloudinary but could not be saved to your profile record in Firestore.';
                setErrorMessage(msg);
                toast.error(msg);
            }
        }

        if (failedFiles.length > 0) {
            const errMsg = `Failed to upload ${failedFiles.length} image(s): ${failedFiles[0].error}`;
            setErrorMessage(errMsg);
            toast.error(errMsg);
        }

        setUploading(false);
    };

    return (
        <div className="w-full space-y-6 text-left">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-4">
                <div>
                    <h3 className="text-lg sm:text-xl font-black text-on-surface tracking-tight flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-primary" /> Service Portfolio Management
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        Upload high-quality photos of your completed projects to build trust with customers.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                        {existingImages.length + stagedFiles.length} / {MAX_PORTFOLIO_IMAGES} Photos
                    </span>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Cloudinary Configuration Warning Banner if variables missing */}
            {!cloudinaryReady && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium leading-relaxed">
                        Cloudinary configuration missing. Please verify that <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">VITE_CLOUDINARY_CLOUD_NAME</code> and <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">VITE_CLOUDINARY_UPLOAD_PRESET</code> are defined in your <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">.env.local</code> file and restart Vite.
                    </div>
                </div>
            )}

            {/* Error / Success Feedback Banners */}
            {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{errorMessage}</div>
                    <button
                        type="button"
                        onClick={() => setErrorMessage('')}
                        className="text-red-500 hover:text-red-800 font-bold text-xs"
                    >
                        ✕
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 font-semibold">{successMessage}</div>
                    <button
                        type="button"
                        onClick={() => setSuccessMessage('')}
                        className="text-emerald-500 hover:text-emerald-800 font-bold text-xs"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Drag & Drop Upload Trigger Zone */}
            {isOwner && existingImages.length + stagedFiles.length < MAX_PORTFOLIO_IMAGES && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="portfolio-file-input"
                    />

                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            dragActive
                                ? 'border-primary bg-primary/5 scale-[1.01]'
                                : 'border-outline-variant/60 hover:border-primary hover:bg-[#e6f4f1]/30 bg-surface-container-lowest'
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-[#e6f4f1] text-[#004d4c] flex items-center justify-center mb-3 shadow-xs">
                            <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs sm:text-sm font-extrabold text-on-surface">
                            Click to browse or drag & drop portfolio images here
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-medium mt-1">
                            Supports JPG, JPEG, PNG, and WebP (Max 5MB each, up to {MAX_PORTFOLIO_IMAGES} photos)
                        </p>
                    </div>
                </div>
            )}

            {/* Staged Previews (Before Saving) */}
            {stagedFiles.length > 0 && (
                <div className="space-y-3 bg-[#f0f7f6] p-4 sm:p-5 rounded-2xl border border-primary/20">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <h4 className="text-xs sm:text-sm font-extrabold text-primary uppercase tracking-wider">
                                New Images Ready to Upload ({stagedFiles.length})
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                stagedFiles.forEach(i => URL.revokeObjectURL(i.previewUrl));
                                setStagedFiles([]);
                            }}
                            className="text-[11px] font-bold text-on-surface-variant hover:text-error transition-colors"
                        >
                            Clear All Staged
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {stagedFiles.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl p-2.5 border border-outline-variant/40 shadow-xs flex flex-col gap-2 relative group"
                            >
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-container">
                                    <img
                                        src={item.previewUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveStaged(item.id)}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-xs"
                                        title="Remove this preview"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                        {item.sizeFormatted}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleTitleChange(item.id, e.target.value)}
                                    placeholder="Add service description/title..."
                                    className="w-full text-xs font-semibold px-2 py-1 rounded border border-outline-variant/30 outline-none focus:border-primary"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Upload & Save Action Bar */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-primary/20">
                        {uploading ? (
                            <div className="space-y-1.5 w-full sm:max-w-xs">
                                <div className="flex justify-between items-center text-[11px] font-bold text-primary">
                                    <span>Uploading photo {uploadProgress.current} of {uploadProgress.total}</span>
                                    <span>{uploadProgress.percent || 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-primary/15 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-150"
                                        style={{ width: `${uploadProgress.percent || 0}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-[11px] text-on-surface-variant font-medium">
                                Review previews above, then click save to upload to your profile.
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={handleUploadAndSave}
                            disabled={uploading || !cloudinaryReady}
                            className="h-10 px-6 bg-[#004d4c] hover:bg-[#004d4c]/90 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Uploading ({uploadProgress.current}/{uploadProgress.total})...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span>Upload & Save {stagedFiles.length} Photo{stagedFiles.length > 1 ? 's' : ''}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Currently Saved Portfolio Images */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-on-surface uppercase tracking-wider">
                        Live Portfolio Photos ({existingImages.length})
                    </h4>
                    {existingImages.length > 0 && (
                        <p className="text-[10px] text-on-surface-variant font-medium">
                            Deleting an image removes it from your visible profile and database immediately.
                        </p>
                    )}
                </div>

                {existingImages.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant/60">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-on-surface">No portfolio images uploaded yet</p>
                        <p className="text-[11px] text-on-surface-variant font-medium max-w-sm mx-auto">
                            Showcase your craftsmanship! Upload pictures of your previous work, installations, and repairs to attract more customer bookings.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {existingImages.map((imgItem, idx) => {
                            const imgUrl = typeof imgItem === 'object' ? imgItem.url : imgItem;
                            const title = typeof imgItem === 'object' ? imgItem.title || imgItem.name : `Work Photo ${idx + 1}`;

                            return (
                                <div
                                    key={typeof imgItem === 'object' ? imgItem.id || idx : idx}
                                    className="group relative rounded-xl overflow-hidden aspect-square border border-outline-variant/30 bg-surface-container shadow-2xs"
                                >
                                    <img
                                        src={imgUrl}
                                        alt={title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                                        <div className="flex justify-end gap-1">
                                            <a
                                                href={imgUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-7 h-7 rounded-full bg-white/90 text-on-surface flex items-center justify-center hover:bg-white transition-colors"
                                                title="View full resolution"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            {isOwner && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExisting(imgItem)}
                                                    className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                                                    title="Delete this image"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-white font-semibold truncate">
                                            {title}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioManager;
