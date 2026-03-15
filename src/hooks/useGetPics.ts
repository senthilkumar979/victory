'use client'

import { useCallback, useEffect, useState } from "react";
import {
  CLOUDINARY_FOLDERS,
  DEFAULT_MAX_RESULTS,
  DEFAULT_TRANSFORMATION,
} from '../constants/cloudinary';
import { CloudinaryImage, UseGetPicsOptions, UseGetPicsReturn } from "../types/gallery.types";

export const useGetPics = (
  options: UseGetPicsOptions = {}
): UseGetPicsReturn => {
  const {
    folders = CLOUDINARY_FOLDERS,
    maxResults = DEFAULT_MAX_RESULTS,
    transformation = DEFAULT_TRANSFORMATION,
  } = options;

  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState({
    currentFolder: null as string | null,
    completedFolders: [] as string[],
    totalFolders: folders.length,
  });

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setImages([]);
    setLoadingProgress({
      currentFolder: null,
      completedFolders: [],
      totalFolders: folders.length,
    });

    const allImages: CloudinaryImage[] = [];
    const completedFolders: string[] = [];

    try {
      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];

        // Update loading progress
        setLoadingProgress({
          currentFolder: folder,
          completedFolders: [...completedFolders],
          totalFolders: folders.length,
        });

        try {
          const response = await fetch(
            `/api/cloudinary/images?folder=${encodeURIComponent(
              folder
            )}&max_results=${maxResults}&transformation=${encodeURIComponent(
              transformation
            )}`
          );

          if (!response.ok) {
            continue; // Skip this folder and continue with the next one
          }

          const data = await response.json();

          if (data.error) {
            continue; // Skip this folder and continue with the next one
          }

          // Add folder information to each image
          const folderImages = (data.images || []).map(
            (image: CloudinaryImage) => ({
              ...image,
              folder: folder,
            })
          );

          allImages.push(...folderImages);
          completedFolders.push(folder);

          // Update images state after each folder (for progressive loading)
          setImages([...allImages]);

          // Update loading progress
          setLoadingProgress({
            currentFolder: i < folders.length - 1 ? folders[i + 1] : null,
            completedFolders: [...completedFolders],
            totalFolders: folders.length,
          });

          // Add a small delay between folder requests to avoid overwhelming the API
          if (i < folders.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch {
          // Continue with the next folder
        }
      }

      if (allImages.length === 0) {
        setError("There is something went wrong while fetching images");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch images";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingProgress({
        currentFolder: null,
        completedFolders: [...completedFolders],
        totalFolders: folders.length,
      });
    }
  }, [folders, maxResults, transformation]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    isLoading,
    error,
    refetch: fetchImages,
    loadingProgress,
  };
};
