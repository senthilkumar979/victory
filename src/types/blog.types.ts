export interface Blog {
  id: string | null
  title: string | null
  author_name: string | null
  published_date: string | null
  cover_image_url: string | null
  link: string
  username: string | null
}

export interface BlogCardProps {
  blog: Blog;
}

export interface AddBlogRequest {
  username: string;
}

export interface AddBlogResponse {
  success: boolean;
  message: string;
  data?: Blog;
  error?: string;
}

export interface AddAllBlogsResponseData {
  added: number;
  skipped: number;
  errors: string[];
  total: number;
}

export interface AddAllBlogsResponse {
  success: boolean;
  message: string;
  data: AddAllBlogsResponseData;
}

export interface UseBlogsOptions {
  authorFilter?: string;
  pageSize?: number;
}

export interface UseBlogsReturn {
  blogs: Blog[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}