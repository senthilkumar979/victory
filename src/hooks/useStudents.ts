import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ProfileData, UseStudentsReturn } from "../types/student.types";

// Safe JSON parsing function
const safeJsonParse = (value: unknown, fallback: unknown = null) => {
  if (!value) return fallback;

  // If it's already an object/array, return it
  if (typeof value === "object") {
    return value;
  }

  // If it's a string, try to parse it
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("Failed to parse JSON:", value, error);
      return fallback;
    }
  }

  return fallback;
};

export const useStudents = (): UseStudentsReturn => {
  const [students, setStudents] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("students")
        .select("id, name, picture, role, company, email, social_links, batch")
        .order("batch", { ascending: false })
        .order("name", { ascending: true });
      if (fetchError) {
        throw fetchError;
      }

      if (data) {

        // Transform the data to match ProfileData interface
        const transformedData: ProfileData[] = data.map((student) => ({
          id: student.id,
          name: student.name,
          picture: student.picture,
          role: student.role,
          company: student.company,
          email: student.email,
          socialLinks: safeJsonParse(student.social_links, {}),
          batch: student.batch,
        }));

        setStudents(transformedData);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
  };
};
