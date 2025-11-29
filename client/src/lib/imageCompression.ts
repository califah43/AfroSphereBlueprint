/**
 * Image compression and optimization utilities
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  maxSizeBytes?: number; // Max file size in bytes (default 5MB)
}

/**
 * Compress image file with size and quality controls
 * Used for profile pictures before Firebase upload
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 500,
    maxHeight = 500,
    quality = 0.85,
    maxSizeBytes = 5 * 1024 * 1024, // 5MB default
  } = options;

  // Validate file type
  if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
    throw new Error("Only JPG, JPEG, and PNG files are allowed");
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeBytes / (1024 * 1024)}MB limit`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality settings
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Add cache-busting timestamp to image URL
 */
export function getCacheBustedUrl(url: string): string {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
}
