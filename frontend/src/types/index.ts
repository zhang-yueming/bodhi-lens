export type Material = 'BRONZE' | 'STONE'

export type SourceType = 'Auction' | 'Catalog' | 'Museum' | 'Private Collection'

export const PERIOD_OPTIONS = [
  'Sixteen Kingdoms',
  'Northern Dynasties',
  'Northern Wei',
  'Eastern Wei',
  'Western Wei',
  'Northern Qi',
  'Northern Zhou',
  'Southern Dynasties',
  'Liu Song',
  'Southern Qi',
  'Southern Liang',
  'Southern Chen',
  'Sui',
  'Tang',
  'Five Dynasties',
  'Korean',
  'Japanese',
  'Other',
] as const

export const SOURCE_OPTIONS: SourceType[] = ['Auction', 'Catalog', 'Museum', 'Private Collection']

export interface Currency {
  code: string
  label: string
  symbol: string
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', label: 'USD', symbol: '$' },
  { code: 'JPY', label: 'JPY', symbol: '¥' },
  { code: 'CNY', label: 'CNY', symbol: '¥' },
  { code: 'HKD', label: 'HKD', symbol: '$' },
  { code: 'EUR', label: 'EUR', symbol: '€' },
  { code: 'GBP', label: 'GBP', symbol: '£' },
  { code: 'KRW', label: 'KRW', symbol: '₩' },
  { code: 'TWD', label: 'TWD', symbol: '$' },
  { code: 'SGD', label: 'SGD', symbol: '$' },
  { code: 'AUD', label: 'AUD', symbol: '$' },
  { code: 'CAD', label: 'CAD', symbol: '$' },
  { code: 'CHF', label: 'CHF', symbol: 'Fr' },
  { code: 'THB', label: 'THB', symbol: '฿' },
]

export interface ItemImage {
  id: number
  url: string
  isMain: boolean
  sortOrder: number
}

export interface Attachment {
  id: number
  filename: string
  contentType: string | null
  fileSize: number | null
  url: string
}

export interface Item {
  id: number
  customName: string | null
  material: Material
  period: string | null
  lengthCm: number | null
  widthCm: number | null
  heightCm: number | null
  source: string | null
  sourceNotes: string | null
  remarks: string | null
  price: number | null
  currency: string | null
  isOwned: boolean
  provenance: string[]
  attachments: Attachment[]
  mainImage: ItemImage | null
  images: ItemImage[]
  createdAt: string
  updatedAt: string
}

export interface ItemFilters {
  material?: Material
  period?: string
  source?: string
}

export interface UploadedImage {
  id: number
  url: string
  s3Key: string
}
