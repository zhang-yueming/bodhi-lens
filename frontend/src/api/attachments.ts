import client from './client'
import type { Attachment } from '../types'

export const attachmentsApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client.post<Attachment>('/attachments/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  delete: (id: number) => client.delete(`/attachments/${id}`),
}
