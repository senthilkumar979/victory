import type { ProfileData } from "@/types/student.types";

export interface UserSearchProps {
  onSelect: (student: ProfileData) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}
