import { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "@/lib/imageCompression";

export function useProfilePictureUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadProfilePicture = async (file: File, userId: string): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // Compress the image
      const compressedBlob = await compressImage(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
      });

      // Create a File from the compressed blob
      const compressedFile = new File([compressedBlob], "profile.jpg", {
        type: "image/jpeg",
      });

      // Upload to Firebase Storage
      const storageRef = ref(storage, `users/${userId}/profile.jpg`);
      await uploadBytes(storageRef, compressedFile);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Add cache-busting timestamp
      const cacheBustedUrl = `${downloadURL}?t=${Date.now()}`;

      // Update user profile in backend
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImageUrl: cacheBustedUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile picture in database");
      }

      setIsUploading(false);
      return cacheBustedUrl;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to upload profile picture";
      setError(errorMessage);
      setIsUploading(false);
      return null;
    }
  };

  return { uploadProfilePicture, isUploading, error };
}
