import client from './client'
import type { Item, ItemFilters } from '../types'

export interface ItemFormData {
  customName?: string
  material: string
  period?: string
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  source?: string
  sourceNotes?: string
  remarks?: string
  price?: number
  currency?: string
  isOwned?: boolean
  provenance?: string[]
  attachmentIds?: number[]
  imageIds: number[]
  mainImageId?: number
}

export const itemsApi = {
  list: (filters?: ItemFilters) =>
    client.get<Item[]>('/items', { params: filters }).then(r => r.data),

  get: (id: number) =>
    client.get<Item>(`/items/${id}`).then(r => r.data),

  create: (data: ItemFormData) =>
    client.post<Item>('/items', data).then(r => r.data),

  update: (id: number, data: ItemFormData) =>
    client.put<Item>(`/items/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/items/${id}`),
}
