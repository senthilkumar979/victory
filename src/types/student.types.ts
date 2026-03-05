/**
 * Student related types
 */

export interface Experience {
  company: string;
  role: string;
  summary: string;
  website?: string;
}

export interface MentorBridgeExp {
  company: string;
  role: string;
  summary: string;
  website?: string;
}

export interface ISocialLinks {
  linkedIn: string;
  gitHub: string;
  website?: string;
}

export interface ProfileData {
  id: string;
  name: string;
  picture: string;
  role: string;
  company?: string;
  summary?: string;
  email: string;
  experience?: Experience[];
  mentorBridgeExp?: MentorBridgeExp;
  skillSets?: string[];
  inspirations?: string[];
  socialLinks?: ISocialLinks;
  resumeLink?: string;
  batch: string;
}

export interface StudentCardProps {
  profile: ProfileData;
  onClick?: () => void;
}

export interface UseStudentsReturn {
  students: ProfileData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseStudentReturn {
  student: ProfileData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
