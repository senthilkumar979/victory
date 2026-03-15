/**
 * Cloudinary folder configuration
 * Add or remove folder names as needed
 */
export const CLOUDINARY_FOLDERS = [
  "Tamilpreneur",
  "technical_training_2025",
  "batch_2025",
  "product_dev_center",
  "alamaram_demo",
  "internal_demo",
] as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[number];

/**
 * Default transformation settings
 */
export const DEFAULT_TRANSFORMATION = "f_auto,q_auto";

/**
 * Maximum results per folder
 */
export const DEFAULT_MAX_RESULTS = 50;

export const getFolderName = (folder: CloudinaryFolder) => {
  const folders = {
    Tamilpreneur: "Tamilpreneur Startup event",
    technical_training_2025: "Technical Training Sessions",
    batch_2025: "Batch 2025",
    product_dev_center: "Product Dev Center",
    alamaram_demo: "Alamaram Demo Day",
    internal_demo: "Internal Demo 2025",
  };
  return folders[folder];
};

export const getTagline = (folder: CloudinaryFolder) => {
  const folders = {
    Tamilpreneur: "Grand Sangamam event of Tamilpreneur - June, 2025",
    technical_training_2025:
      "Technical Training Sessions conducted by MentorBridge 2025",
    batch_2025: "Students of MentorBridge Batch 2025",
    product_dev_center:
      "Development Center at SSM Institute of Engineering and Technology, Dindigul",
    alamaram_demo: "Hosted by GoZen, Coimbatore - June, 2025",
    internal_demo:
      "Demo of products (SecuroSphere, StubLab, StuPro) - March, 2025",
  };
  return folders[folder];
};
