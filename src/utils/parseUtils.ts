export const safeJsonParse = (value: unknown, fallback: unknown = null) => {
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