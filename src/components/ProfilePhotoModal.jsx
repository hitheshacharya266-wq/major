import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    uploadProviderProfileImage,
    updateProviderProfilePhoto
} from '../firebase/firestoreService';
import {
    ALLOWED_IMAGE_TYPES,
    MAX_FILE_SIZE_BYTES,
    isCloudinaryConfigured
} from '../services/cloudinaryService';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import ProviderAvatar from './ProviderAvatar';
import {
    Camera,
    Upload,
    Trash2,
    X,
    AlertCircle,
    Loader2,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePhotoModal = ({
    isOpen,
    onClose,
    providerId,
    currentPhotoURL = '',
    providerName = 'Provider',
    gender = 'male',
    category = 'general',
    onPhotoUpdated
}) => {
    const { currentUser, refreshUserProfile } = useAuth();
    const fileInputRef = useRef(null);

    const [stagedFile, setStagedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [removing, setRemoving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isOwner = currentUser?.uid && currentUser.uid === providerId;
    const cloudinaryReady = isCloudinaryConfigured();

    const previewUrlRef = useRef(previewUrl);
    previewUrlRef.current = previewUrl;

    // Revoke temporary blob URL on unmount or reset
    useEffect(() => {
        return () => {
            if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    // Reset internal state when modal opens or closes
    useEffect(() => {
        if (!isOpen) {
            if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
            setStagedFile(null);
            setPreviewUrl('');
            setUploading(false);
            setUploadProgress(0);
            setErrorMessage('');
            setRemoving(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleFileValidationAndStage = (file) => {
        setErrorMessage('');
        if (!file) return;

        const fileType = (file.type || '').toLowerCase();
        if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
            const err = `"${file.name}" is not a supported format. Please select a JPG, JPEG, PNG, or WebP image.`;
            setErrorMessage(err);
            toast.error(err);
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            const err = `"${file.name}" exceeds the 5 MB limit (${sizeMb} MB). Please choose a smaller photo.`;
            setErrorMessage(err);
            toast.error(err);
            return;
        }

        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        const newPreview = URL.createObjectURL(file);
        setStagedFile(file);
        setPreviewUrl(newPreview);
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileValidationAndStage(e.target.files[0]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCancelStaged = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setStagedFile(null);
        setPreviewUrl('');
        setErrorMessage('');
    };

    const handleUploadAndSave = async () => {
        if (!isOwner) {
            toast.error('You are not authorized to update this profile photo.');
            return;
        }

        if (!cloudinaryReady) {
            const err = 'Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local.';
            setErrorMessage(err);
            toast.error(err);
            return;
        }

        if (!stagedFile) {
            toast.error('Please choose a photo to upload.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setErrorMessage('');

        try {
            // 1. Upload photo to Cloudinary
            const uploadResult = await uploadProviderProfileImage(providerId, stagedFile, (percent) => {
                setUploadProgress(percent);
            });

            const newPhotoURL = uploadResult.url;

            // 2. Persist in Firestore
            await updateProviderProfilePhoto(providerId, newPhotoURL);

            // 3. Update Firebase Auth currentUser photoURL if current session matches
            if (auth.currentUser && auth.currentUser.uid === providerId) {
                await updateProfile(auth.currentUser, { photoURL: newPhotoURL }).catch(() => {});
            }

            // 4. Refresh global AuthContext
            if (refreshUserProfile) {
                await refreshUserProfile();
            }

            // 5. Notify parent component
            if (onPhotoUpdated) {
                onPhotoUpdated(newPhotoURL);
            }

            toast.success('Profile photo updated successfully! 🎉');
            onClose();
        } catch (err) {
            console.error('Failed to upload profile photo:', err);
            const msg = err.message || 'Failed to upload photo. Please check your network and Cloudinary setup.';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        if (!isOwner) {
            toast.error('You are not authorized to modify this profile photo.');
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to remove your profile photo and restore your default character avatar?'
        );
        if (!confirmed) return;

        setRemoving(true);
        setErrorMessage('');

        try {
            // 1. Clear photo from Firestore
            await updateProviderProfilePhoto(providerId, '');

            // 2. Clear photo in Firebase Auth
            if (auth.currentUser && auth.currentUser.uid === providerId) {
                await updateProfile(auth.currentUser, { photoURL: '' }).catch(() => {});
            }

            // 3. Refresh global AuthContext
            if (refreshUserProfile) {
                await refreshUserProfile();
            }

            // 4. Notify parent component
            if (onPhotoUpdated) {
                onPhotoUpdated('');
            }

            // Clean up any staged file
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            setStagedFile(null);
            setPreviewUrl('');

            toast.success('Profile photo removed. Default avatar restored.');
            onClose();
        } catch (err) {
            console.error('Failed to remove profile photo:', err);
            const msg = err.message || 'Failed to remove photo. Please try again.';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setRemoving(false);
        }
    };

    const displayPhoto = previewUrl || currentPhotoURL;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto select-none"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-outline-variant/30 my-auto text-left space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Camera className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-on-surface tracking-tight">
                                Profile Photo
                            </h3>
                            <p className="text-[11px] sm:text-xs text-on-surface-variant font-medium">
                                Visible to customers on search results, bookings &amp; your public profile.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={uploading || removing}
                        className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer transition-colors disabled:opacity-40"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cloudinary Missing Config Warning */}
                {!cloudinaryReady && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 font-medium leading-relaxed">
                            Cloudinary configuration missing. Verify <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold text-[11px]">VITE_CLOUDINARY_CLOUD_NAME</code> and <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold text-[11px]">VITE_CLOUDINARY_UPLOAD_PRESET</code> in your <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold text-[11px]">.env.local</code>.
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span className="flex-1 font-medium">{errorMessage}</span>
                        <button
                            type="button"
                            onClick={() => setErrorMessage('')}
                            className="text-red-500 hover:text-red-800 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Circular / Squircle Avatar Preview */}
                <div className="flex flex-col items-center justify-center py-2 space-y-4">
                    <div className="relative group">
                        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-lg bg-surface-container flex items-center justify-center p-1">
                            {displayPhoto ? (
                                <img
                                    src={displayPhoto}
                                    alt={providerName}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                <ProviderAvatar
                                    name={providerName}
                                    gender={gender}
                                    category={category}
                                    photoURL=""
                                    size="xl"
                                    className="!w-full !h-full !rounded-2xl border-none shadow-none"
                                />
                            )}
                        </div>

                        {/* Staged indicator badge */}
                        {stagedFile && (
                            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                                <Sparkles className="w-3 h-3" /> Ready
                            </span>
                        )}
                    </div>

                    {/* Staged File Info */}
                    {stagedFile ? (
                        <div className="text-center space-y-1">
                            <p className="text-xs font-bold text-on-surface truncate max-w-xs">
                                {stagedFile.name}
                            </p>
                            <p className="text-[11px] text-primary font-semibold">
                                Size: {formatBytes(stagedFile.size)} • Preview ready to save
                            </p>
                        </div>
                    ) : (
                        <p className="text-[11px] text-on-surface-variant font-medium text-center">
                            {currentPhotoURL ? 'Current custom profile photo' : 'Default character avatar currently active'}
                        </p>
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="profile-photo-input"
                />

                {/* Upload Progress Bar */}
                {uploading && (
                    <div className="space-y-1.5 p-3.5 bg-primary/5 rounded-2xl border border-primary/20">
                        <div className="flex justify-between items-center text-xs font-extrabold text-primary">
                            <span>Uploading photo to Cloudinary...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-primary/15 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-200"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions Bar */}
                <div className="space-y-3 pt-2 border-t border-outline-variant/20">
                    {stagedFile ? (
                        /* Save / Cancel Staged Preview Actions */
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleCancelStaged}
                                disabled={uploading}
                                className="flex-1 h-11 px-4 border border-outline-variant/40 hover:bg-surface-container text-on-surface rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer text-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUploadAndSave}
                                disabled={uploading || !cloudinaryReady}
                                className="flex-1 h-11 px-4 bg-primary hover:bg-[#004d4c] text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving ({uploadProgress}%)...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Save Profile Photo</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Choose / Replace / Remove Actions */
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || removing || !cloudinaryReady}
                                className="h-11 px-5 bg-primary hover:bg-[#004d4c] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Upload className="w-4 h-4" />
                                <span>{currentPhotoURL ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                            </button>

                            {currentPhotoURL && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    disabled={uploading || removing}
                                    className="h-11 px-4 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    title="Remove custom photo and restore character avatar"
                                >
                                    {removing ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    )}
                                    <span>Remove Photo</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Explanatory footer note */}
                    <div className="pt-2 text-[11px] text-on-surface-variant font-medium leading-relaxed">
                        <p>• Allowed formats: <strong>JPG, JPEG, PNG, WebP</strong>. Maximum file size: <strong>5 MB</strong>.</p>
                        <p className="pt-0.5">• Removing your photo restores your illustrated character avatar immediately.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePhotoModal;
