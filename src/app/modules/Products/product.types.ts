export interface ProductStorySection {
  title: string
  paragraphs: string[]
}

export interface ProductStory {
  lead: string
  sections: ProductStorySection[]
}

export type ProductTheme = 'emerald' | 'violet' | 'amber'

export type ProductIconKey = 'shield' | 'code2' | 'graduationCap'

export interface Product {
  id: string
  name: string
  category: string
  tagline: string
  features: string[]
  impact: string
  websiteUrl: string
  detailPageUrl: string | null
  imageUrl: string
  theme: ProductTheme
  icon: ProductIconKey
  story: ProductStory
}

export interface ProductCatalog {
  products: Product[]
}
