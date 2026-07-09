import { supabase } from "@/lib/supabaseClient";
import { mapSupabaseStudentRowToProfile } from "@/lib/mapSupabaseStudentRowToProfile";
import { getStudentSelectColumns } from "@/lib/studentSelectColumns";
import { useCallback, useEffect, useState } from "react";
import { ProfileData, UseStudentReturn } from "../types/student.types";



export const useStudent = (
  studentId: string,
  options?: { includeAdminFields?: boolean },
): UseStudentReturn => {
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
        .select(getStudentSelectColumns(options?.includeAdminFields))
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
        setStudent(mapSupabaseStudentRowToProfile(data as unknown as Record<string, unknown>));
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch student");
    } finally {
      setLoading(false);
    }
  }, [studentId, options?.includeAdminFields]);

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
