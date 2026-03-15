/**
 * Gallery and Cloudinary related types
 */

export interface GalleryImage {
  id: string;
  src: string;
  title: string;
  alt: string;
}

export interface CloudinaryImage {
  id: string;
  src: string;
  title: string;
  alt: string;
  public_id: string;
  width: number;
  height: number;
  folder: string;
}

export interface CloudinaryResource {
  public_id: string;
  width: number;
  height: number;
  created_at: string;
  [key: string]: unknown;
}

export interface CloudinarySearchResult {
  resources: CloudinaryResource[];
  total_count: number;
  [key: string]: unknown;
}

export interface GalleryProps {
  images: GalleryImage[];
  className?: string;
  showTitle?: boolean;
  gridCols?: "1" | "2" | "3" | "4" | "5" | "6";
}

export interface UseGetPicsOptions {
  folders?: string[];
  maxResults?: number;
  transformation?: string;
}

export interface LoadingProgress {
  currentFolder: string | null;
  completedFolders: string[];
  totalFolders: number;
}

export interface UseGetPicsReturn {
  images: CloudinaryImage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  loadingProgress: LoadingProgress;
}
