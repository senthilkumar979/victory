import { getFolderName } from '@/constants/cloudinary'

const FOLDER_KEYS = [
  'Tamilpreneur',
  'technical_training_2025',
  'batch_2025',
  'product_dev_center',
  'alamaram_demo',
  'internal_demo',
] as const

export const getDisplayFolderName = (folder: string): string => {
  if (FOLDER_KEYS.includes(folder as (typeof FOLDER_KEYS)[number])) {
    return getFolderName(folder as (typeof FOLDER_KEYS)[number])
  }
  return folder
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
