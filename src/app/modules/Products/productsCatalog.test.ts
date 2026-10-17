import { describe, expect, it } from 'vitest'

import catalog from './product-details.json'
import { productThemeClasses } from './productTheme'
import type { ProductIconKey, ProductTheme } from './product.types'

const SHOWCASE_ICONS: ProductIconKey[] = ['shield', 'code2', 'graduationCap']

interface CatalogProduct {
  id: string
  theme: string
  icon: string
  websiteUrl: string
  imageUrl: string
  features: string[]
}

describe('product catalog', () => {
  it('gives every product a theme and icon the cards and drawer can render', () => {
    const products = catalog.products as CatalogProduct[]
    const themes = Object.keys(productThemeClasses)

    expect(products.length).toBeGreaterThan(0)
    expect(new Set(products.map((product) => product.id)).size).toBe(
      products.length,
    )

    for (const product of products) {
      expect(themes).toContain(product.theme)
      expect(SHOWCASE_ICONS).toContain(product.icon)
      expect(product.websiteUrl.startsWith('https://')).toBe(true)
      expect(product.imageUrl.startsWith('https://')).toBe(true)
      expect(product.features.length).toBeGreaterThan(0)

      const theme = productThemeClasses[product.theme as ProductTheme]
      expect(theme.glow.length).toBeGreaterThan(0)
      expect(theme.cardGradient.length).toBeGreaterThan(0)
      expect(theme.chip.length).toBeGreaterThan(0)
      expect(theme.text.length).toBeGreaterThan(0)
      expect(theme.iconWrap.length).toBeGreaterThan(0)
    }
  })
})
