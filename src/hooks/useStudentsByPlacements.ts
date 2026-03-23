import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ProfileData } from "../types/student.types";

export const useStudentsByPlacements = () => {
  const [students, setStudents] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("students")
          .select("id, name, picture, role, company, email, batch")
          .neq("company", "MentorBridge")
          .order("batch", { ascending: false })
          .order("name", { ascending: true });

        if (fetchError) throw fetchError;

        const transformed = (data || []).map((student: ProfileData) => ({
          id: student.id,
          name: student.name,
          picture: student.picture,
          role: student.role,
          company: student.company,
          email: student.email,
          batch: student.batch,
        }));

        if (isMounted) {
          setStudents(transformed);
        }
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to fetch students");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  return { students, loading, error };
};