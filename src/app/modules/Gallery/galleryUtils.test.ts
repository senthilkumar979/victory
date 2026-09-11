import { describe, expect, it } from 'vitest'

import { getDisplayFolderName } from './galleryUtils'

describe('getDisplayFolderName', () => {
  it('uses the curated Cloudinary label for known folders', () => {
    expect(getDisplayFolderName('Tamilpreneur')).toBe(
      'Tamilpreneur Startup event',
    )
    expect(getDisplayFolderName('technical_training_2025')).toBe(
      'Technical Training Sessions',
    )
    expect(getDisplayFolderName('batch_2025')).toBe('Batch 2025')
  })

  it('title-cases unknown snake_case folders', () => {
    expect(getDisplayFolderName('alumni_meetup_2026')).toBe(
      'Alumni Meetup 2026',
    )
    expect(getDisplayFolderName('Demo')).toBe('Demo')
  })
})
