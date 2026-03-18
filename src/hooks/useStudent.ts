import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";
import { ProfileData, UseStudentReturn } from "../types/student.types";
import { safeJsonParse } from "../utils/parseUtils";



export const useStudent = (studentId: string): UseStudentReturn => {
  const [student, setStudent] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = useCallback(async () => {
    if (!studentId) {
      setError("Student ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          // No rows returned
          setStudent(null);
        } else {
          throw fetchError;
        }
      } else if (data) {
        // Transform the data to match ProfileData interface
        const transformedStudent: ProfileData = {
          id: data.id,
          name: data.name,
          picture: data.picture,
          role: data.role,
          company: data.company,
          summary: data.summary,
          email: data.email,
          mediumUsername: data.medium_username ?? undefined,
          experience: safeJsonParse(data.experience, []),
          mentorBridgeExp: safeJsonParse(data.mentor_bridge_exp, {}),
          skillSets: safeJsonParse(data.skill_sets, []) as string[],
          inspirations: safeJsonParse(data.inspirations, []) as string[],
          socialLinks: safeJsonParse(data.social_links, {}),
          resumeLink: data.resume_link,
          batch: data.batch,
          gender: (() => {
            const raw = typeof data.gender === 'string' ? data.gender.trim() : ''
            const g = raw.toUpperCase()
            return g === 'M' || g === 'F' ? g : undefined
          })(),
          serialNo: data.serial_no,
        };

        setStudent(transformedStudent);
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch student");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  return {
    student,
    loading,
    error,
    refetch: fetchStudent,
  };
};
