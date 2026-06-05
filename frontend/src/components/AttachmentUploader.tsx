import { useState } from 'react'
import { Button, List, Typography, Space, Popconfirm, Progress, message } from 'antd'
import { PaperClipOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { attachmentsApi } from '../api/attachments'
import type { Attachment } from '../types'

interface Props {
  value: Attachment[]
  onChange: (attachments: Attachment[]) => void
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function AttachmentUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [messageApi, ctx] = message.useMessage()

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setProgress(0)
    const added: Attachment[] = []
    for (let i = 0; i < files.length; i++) {
      try {
        const att = await attachmentsApi.upload(files[i])
        added.push(att)
      } catch {
        messageApi.error(`Failed to upload ${files[i].name}`)
      }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }
    onChange([...value, ...added])
    setUploading(false)
  }

  const handleRemove = async (att: Attachment) => {
    try {
      await attachmentsApi.delete(att.id)
      onChange(value.filter(a => a.id !== att.id))
    } catch {
      messageApi.error('Failed to remove attachment')
    }
  }

  return (
    <div>
      {ctx}
      {value.length > 0 && (
        <List
          size="small"
          style={{ marginBottom: 10 }}
          dataSource={value}
          renderItem={att => (
            <List.Item
              style={{ padding: '4px 0' }}
              actions={[
                <Popconfirm
                  key="del"
                  title="Remove this attachment?"
                  okText="Remove"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleRemove(att)}
                >
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <Space>
                <PaperClipOutlined style={{ color: '#8c8c8c' }} />
                <a href={att.url} target="_blank" rel="noopener noreferrer">
                  <Typography.Text style={{ maxWidth: 340 }} ellipsis={{ tooltip: att.filename }}>
                    {att.filename}
                  </Typography.Text>
                </a>
                {att.fileSize && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {formatBytes(att.fileSize)}
                  </Typography.Text>
                )}
              </Space>
            </List.Item>
          )}
        />
      )}

      {uploading && <Progress percent={progress} size="small" style={{ marginBottom: 8 }} />}

      <Button
        icon={<UploadOutlined />}
        type="dashed"
        loading={uploading}
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.multiple = true
          input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.txt'
          input.onchange = e => handleFiles((e.target as HTMLInputElement).files)
          input.click()
        }}
      >
        Upload file
      </Button>
    </div>
  )
}
