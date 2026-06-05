import client from './client'
import type { UploadedImage } from '../types'

export const imagesApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client.post<UploadedImage>('/images/upload', form).then(r => r.data)
  },

  delete: (id: number) => client.delete(`/images/${id}`),
}
