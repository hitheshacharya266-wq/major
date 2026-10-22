/**
 * Cloudinary Service
 *
 * Handles direct, unsigned client-side uploads to Cloudinary for provider portfolio images.
 * Keeps Cloudinary API secrets completely off the client browser.
 */

// Cloudinary credentials read safely from Vite environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/** Allowed MIME types for portfolio uploads */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/** Maximum file size in bytes (5 MB) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Maximum images allowed in a provider's portfolio */
export const MAX_PORTFOLIO_IMAGES = 12;

/**
 * Check if Cloudinary environment variables are configured.
 * @returns {boolean}
 */
export const isCloudinaryConfigured = () => {
    return Boolean(CLOUD_NAME && String(CLOUD_NAME).trim() && UPLOAD_PRESET && String(UPLOAD_PRESET).trim());
};

/**
 * Validate an image file before upload.
 * Throws an Error with a user-friendly message if invalid.
 *
 * @param {File} file
 */
export const validateImageFile = (file) => {
    if (!file) {
        throw new Error('No file provided for upload.');
    }

    const fileType = (file.type || '').toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
        throw new Error(`"${file.name}" is not a supported format. Please select a JPG, JPEG, PNG, or WebP image.`);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(`"${file.name}" exceeds the 5 MB size limit (${sizeMb} MB). Please choose a smaller image.`);
    }

    return true;
};

/**
 * Upload a single portfolio image directly to Cloudinary using an unsigned upload preset.
 * Tracks granular upload progress via XMLHttpRequest.
 *
 * @param {File} file - The image file to upload
 * @param {string} [providerId] - Provider UID used to organize images into folder namespaces
 * @param {Function} [onProgress] - Optional progress callback receiving progress percentage (0 - 100)
 * @returns {Promise<object>} Uploaded image metadata (url, publicId, dimensions, format, etc.)
 */
export const uploadPortfolioImageToCloudinary = (file, providerId, onProgress) => {
    return new Promise((resolve, reject) => {
        try {
            validateImageFile(file);
        } catch (validationErr) {
            return reject(validationErr);
        }

        if (!isCloudinaryConfigured()) {
            return reject(new Error(
                'Cloudinary is not configured. Please ensure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are set in your .env.local file and restart Vite.'
            ));
        }

        const cleanCloudName = String(CLOUD_NAME).trim();
        const cleanPreset = String(UPLOAD_PRESET).trim();
        const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cleanCloudName)}/image/upload`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cleanPreset);

        // Organize assets into folder per provider if provider ID is present
        if (providerId) {
            formData.append('folder', `servicehub/portfolio/${providerId}`);
        } else {
            formData.append('folder', 'servicehub/portfolio');
        }

        // Add tagging for easy media asset management in Cloudinary Console
        formData.append('tags', 'servicehub,portfolio');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);
        xhr.timeout = 45000; // 45 seconds timeout

        // Track upload progress
        if (xhr.upload && typeof onProgress === 'function') {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
                    onProgress(percent);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    const fileBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');

                    const result = {
                        id: `port_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        url: data.secure_url || data.url,
                        publicId: data.public_id || '',
                        width: data.width || null,
                        height: data.height || null,
                        format: data.format || file.name.split('.').pop() || '',
                        bytes: data.bytes || file.size,
                        title: fileBaseName,
                        fileName: file.name,
                        createdAt: data.created_at || new Date().toISOString()
                    };

                    resolve(result);
                } catch (parseErr) {
                    reject(new Error(`Failed to parse Cloudinary response: ${parseErr.message}`));
                }
            } else {
                let errorMessage = `Upload failed with HTTP status ${xhr.status}.`;
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    if (errorResponse?.error?.message) {
                        errorMessage = errorResponse.error.message;
                    }
                } catch {
                    // Fallback to generic HTTP status message
                }
                reject(new Error(errorMessage));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error occurred while uploading to Cloudinary. Please check your internet connection.'));
        };

        xhr.ontimeout = () => {
            reject(new Error('Upload to Cloudinary timed out after 45 seconds. Please try again with a faster network connection or smaller file.'));
        };

        xhr.send(formData);
    });
};

/**
 * Upload a single provider profile photo directly to Cloudinary using an unsigned upload preset.
 * Uploads to dedicated folder: `servicehub/profile-photos/${providerId}`
 *
 * @param {File} file - The image file to upload
 * @param {string} providerId - Provider UID
 * @param {Function} [onProgress] - Optional progress callback receiving progress percentage (0 - 100)
 * @returns {Promise<object>} Uploaded image metadata (url, publicId, dimensions, format, etc.)
 */
export const uploadProfilePhotoToCloudinary = (file, providerId, onProgress) => {
    return new Promise((resolve, reject) => {
        try {
            validateImageFile(file);
        } catch (validationErr) {
            return reject(validationErr);
        }

        if (!isCloudinaryConfigured()) {
            return reject(new Error(
                'Cloudinary is not configured. Please ensure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are set in your .env.local file and restart Vite.'
            ));
        }

        const cleanCloudName = String(CLOUD_NAME).trim();
        const cleanPreset = String(UPLOAD_PRESET).trim();
        const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cleanCloudName)}/image/upload`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cleanPreset);

        // Dedicated folder namespace for provider profile photos
        if (providerId) {
            formData.append('folder', `servicehub/profile-photos/${providerId}`);
        } else {
            formData.append('folder', 'servicehub/profile-photos');
        }

        // Dedicated tagging for provider profile photos
        formData.append('tags', 'servicehub,profile-photo,provider');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);
        xhr.timeout = 45000; // 45 seconds timeout

        // Track upload progress
        if (xhr.upload && typeof onProgress === 'function') {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
                    onProgress(percent);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    const fileBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');

                    const result = {
                        id: `profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        url: data.secure_url || data.url,
                        publicId: data.public_id || '',
                        width: data.width || null,
                        height: data.height || null,
                        format: data.format || file.name.split('.').pop() || '',
                        bytes: data.bytes || file.size,
                        title: fileBaseName,
                        fileName: file.name,
                        createdAt: data.created_at || new Date().toISOString()
                    };

                    resolve(result);
                } catch (parseErr) {
                    reject(new Error(`Failed to parse Cloudinary response: ${parseErr.message}`));
                }
            } else {
                let errorMessage = `Upload failed with HTTP status ${xhr.status}.`;
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    if (errorResponse?.error?.message) {
                        errorMessage = errorResponse.error.message;
                    }
                } catch {
                    // Fallback to generic status message
                }
                reject(new Error(errorMessage));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error occurred while uploading profile photo to Cloudinary. Please check your internet connection.'));
        };

        xhr.ontimeout = () => {
            reject(new Error('Upload to Cloudinary timed out after 45 seconds. Please try again with a faster network connection or smaller file.'));
        };

        xhr.send(formData);
    });
};

/**
 * Helper to build an optimized Cloudinary delivery URL with automatic format and compression.
 * Returns the original URL if it is not a Cloudinary URL.
 *
 * @param {string} originalUrl
 * @param {object} options
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {string} [options.crop]
 * @returns {string}
 */
export const getOptimizedCloudinaryUrl = (originalUrl, { width, height, crop = 'limit' } = {}) => {
    if (!originalUrl || typeof originalUrl !== 'string') return '';
    if (!originalUrl.includes('res.cloudinary.com')) return originalUrl;

    const parts = [];
    parts.push('f_auto');
    parts.push('q_auto');
    if (width) parts.push(`w_${width}`);
    if (height) parts.push(`h_${height}`);
    if (width || height) parts.push(`c_${crop}`);

    const transformStr = parts.join(',');
    return originalUrl.replace('/upload/', `/upload/${transformStr}/`);
};
