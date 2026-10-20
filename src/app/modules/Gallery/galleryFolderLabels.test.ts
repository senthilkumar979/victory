import { describe, expect, it } from 'vitest'

import { getDisplayFolderName } from './galleryUtils'

describe('getDisplayFolderName curated labels', () => {
  it('keeps product and demo labels that title-casing would shorten', () => {
    expect(getDisplayFolderName('product_dev_center')).toBe('Product Dev Center')
    expect(getDisplayFolderName('alamaram_demo')).toBe('Alamaram Demo Day')
    expect(getDisplayFolderName('internal_demo')).toBe('Internal Demo 2025')
  })
})
