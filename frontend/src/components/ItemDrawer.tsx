import { useEffect, useMemo, useState } from 'react'
import {
  Drawer, Form, Input, Select, InputNumber, Button, Space,
  Descriptions, Image, Divider, Spin, Popconfirm, message,
  Typography, Switch,
} from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, MinusCircleOutlined, PaperClipOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi } from '../api/items'
import ImageUploader, { type ManagedImage } from './ImageUploader'
import AttachmentUploader from './AttachmentUploader'
import type { Attachment, Item } from '../types'
import { PERIOD_OPTIONS, SOURCE_OPTIONS, CURRENCIES } from '../types'

type DrawerMode = 'detail' | 'edit' | 'create'

interface Props {
  open: boolean
  itemId: number | null
  initialMode?: DrawerMode
  onClose: () => void
  onDeleted?: () => void
}

function LinkText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

const CURRENCY_OPTIONS = CURRENCIES.map(c => ({ label: `${c.code} ${c.symbol}`, value: c.code }))

export default function ItemDrawer({ open, itemId, initialMode = 'detail', onClose, onDeleted }: Props) {
  const [mode, setMode] = useState<DrawerMode>(initialMode)
  const [form] = Form.useForm()
  const [images, setImages] = useState<ManagedImage[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const isOwnedWatch = Form.useWatch('isOwned', form)
  const [messageApi, ctx] = message.useMessage()
  const queryClient = useQueryClient()

  const isCreate = itemId === null

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => itemsApi.get(itemId!),
    enabled: open && !isCreate,
  })

  const sourceNoteOptions = useMemo(() => {
    const notes = new Set<string>()
    const cached = queryClient.getQueriesData<Item[]>({ queryKey: ['items'] })
    cached.forEach(([, data]) => {
      data?.forEach(i => {
        i.sourceNotes?.split(',').forEach(n => { const t = n.trim(); if (t) notes.add(t) })
      })
    })
    return Array.from(notes).sort().map(n => ({ label: n, value: n }))
  }, [queryClient, open])

  useEffect(() => {
    if (!open) return
    setMode(initialMode)
    if (isCreate) { form.resetFields(); setImages([]); setAttachments([]) }
  }, [open, isCreate, initialMode, form])

  useEffect(() => {
    if (item && mode !== 'create') {
      form.setFieldsValue({
        customName: item.customName,
        material: item.material,
        period: item.period ? item.period.split(',') : [],
        lengthCm: item.lengthCm,
        widthCm: item.widthCm,
        heightCm: item.heightCm,
        source: item.source ? item.source.split(',') : [],
        sourceNotes: item.sourceNotes ? item.sourceNotes.split(',') : [],
        remarks: item.remarks,
        price: item.price,
        currency: item.currency,
        isOwned: item.isOwned ?? false,
        provenance: (item.provenance ?? []).map(t => ({ text: t })),
      })
      setImages(item.images.map(img => ({ id: img.id, url: img.url, isMain: img.isMain })))
      setAttachments(item.attachments ?? [])
    }
  }, [item, mode, form])

  const saveMutation = useMutation({
    mutationFn: (values: ReturnType<typeof form.getFieldsValue>) => {
      const provList = ((values.provenance ?? []) as { text: string }[])
        .map(p => p?.text?.trim()).filter(Boolean)
      const payload = {
        ...values,
        period: (values.period as string[] ?? []).join(',') || undefined,
        source: (values.source as string[] ?? []).join(',') || undefined,
        sourceNotes: (values.sourceNotes as string[] ?? []).join(',') || undefined,
        provenance: provList,
        attachmentIds: attachments.map(a => a.id),
        imageIds: images.map(img => img.id),
        mainImageId: images[0]?.id,
      }
      return isCreate ? itemsApi.create(payload) : itemsApi.update(itemId!, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      if (!isCreate) queryClient.invalidateQueries({ queryKey: ['item', itemId] })
      messageApi.success('Saved')
      onClose()
    },
    onError: () => messageApi.error('Save failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => itemsApi.delete(itemId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      messageApi.success('Deleted')
      onDeleted?.()
      onClose()
    },
  })

  const dims = item
    ? [item.lengthCm, item.widthCm, item.heightCm].filter(Boolean).map(v => `${v} cm`).join(' × ')
    : ''
  const sourceLabel = item?.source ? item.source.split(',').join(' · ') : '—'
  const periodLabel = item?.period ? item.period.split(',').join(' / ') : '—'
  const priceLabel = (() => {
    if (item?.price == null) return '—'
    const sym = CURRENCIES.find(c => c.code === item.currency)?.symbol ?? ''
    const formatted = item.price.toLocaleString()
    return item.currency ? `${item.currency} ${sym}${formatted}` : formatted
  })()

  const drawerTitle =
    mode === 'create' ? 'Add Item' :
    mode === 'edit'   ? 'Edit Item' :
    item?.customName ?? `${item?.material === 'BRONZE' ? 'Bronze' : item?.material === 'STONE' ? 'Stone' : ''} · ${periodLabel}`

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={drawerTitle}
      width={580}
      extra={
        mode === 'detail' && !isCreate ? (
          <Space>
            <Popconfirm
              title="Delete this item?"
              description="This cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              onConfirm={() => deleteMutation.mutate()}
            >
              <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isPending} />
            </Popconfirm>
            <Button icon={<EditOutlined />} onClick={() => setMode('edit')}>Edit</Button>
          </Space>
        ) : null
      }
      footer={
        mode !== 'detail' ? (
          <Space>
            <Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>Save</Button>
            <Button onClick={() => isCreate ? onClose() : setMode('detail')}>Cancel</Button>
            {!isCreate && (
              <Popconfirm title="Delete this item?" onConfirm={() => deleteMutation.mutate()}>
                <Button danger loading={deleteMutation.isPending}>Delete</Button>
              </Popconfirm>
            )}
          </Space>
        ) : null
      }
    >
      {ctx}

      {/* ── Detail view ── */}
      {mode === 'detail' && (
        isLoading ? <Spin style={{ display: 'block', marginTop: 60 }} /> : item ? (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>

            <Image.PreviewGroup>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {item.images.map(img => (
                  <Image key={img.id} src={img.url} width={140} />
                ))}
              </div>
            </Image.PreviewGroup>

            <Descriptions bordered column={1} size="small">
              {item.customName && <Descriptions.Item label="Name">{item.customName}</Descriptions.Item>}
              <Descriptions.Item label="Material">
                {item.material === 'BRONZE' ? 'Bronze' : item.material === 'STONE' ? 'Stone' : item.material}
              </Descriptions.Item>
              <Descriptions.Item label="Period">{periodLabel}</Descriptions.Item>
              <Descriptions.Item label="Dimensions">{dims || '—'}</Descriptions.Item>
              <Descriptions.Item label="Source">{sourceLabel}</Descriptions.Item>
              {item.sourceNotes && (
                <Descriptions.Item label="Source Notes">
                  <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>
                    {item.sourceNotes.split(',').join('\n')}
                  </Typography.Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Price">{priceLabel}</Descriptions.Item>
              <Descriptions.Item label="Owned">{item.isOwned ? 'Yes' : 'No'}</Descriptions.Item>
              <Descriptions.Item label="Remarks">
                {item.remarks ? <LinkText text={item.remarks} /> : '—'}
              </Descriptions.Item>
              {item.provenance.length > 0 && (
                <Descriptions.Item label="Provenance">
                  <ol style={{ margin: 0, paddingLeft: 18 }}>
                    {item.provenance.map((t, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        <Typography.Text>{t}</Typography.Text>
                      </li>
                    ))}
                  </ol>
                </Descriptions.Item>
              )}
              {item.isOwned && item.attachments?.length > 0 && (
                <Descriptions.Item label="Attachments">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {item.attachments.map(att => (
                      <Space key={att.id}>
                        <PaperClipOutlined style={{ color: '#8c8c8c' }} />
                        <a href={att.url} target="_blank" rel="noopener noreferrer">
                          {att.filename}
                        </a>
                        {att.fileSize && (
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            ({(att.fileSize / 1024).toFixed(0)} KB)
                          </Typography.Text>
                        )}
                      </Space>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Space>
        ) : null
      )}

      {/* ── Edit / Create form ── */}
      {mode !== 'detail' && (
        <Form form={form} layout="vertical" onFinish={saveMutation.mutate} initialValues={{ isOwned: false, provenance: [] }}>
          <Form.Item label="Name" name="customName">
            <Input placeholder="Optional custom label for this piece" />
          </Form.Item>

          <Form.Item label="Material" name="material" rules={[{ required: true, message: 'Please select a material' }]}>
            <Select options={[{ label: 'Bronze', value: 'BRONZE' }, { label: 'Stone', value: 'STONE' }]} />
          </Form.Item>

          <Form.Item label="Period" name="period">
            <Select mode="multiple" allowClear placeholder="Select period(s)"
              options={PERIOD_OPTIONS.map(p => ({ label: p, value: p }))} />
          </Form.Item>

          <Space align="start">
            <Form.Item label="Length (cm)" name="lengthCm"><InputNumber min={0} style={{ width: 110 }} /></Form.Item>
            <Form.Item label="Width (cm)"  name="widthCm"> <InputNumber min={0} style={{ width: 110 }} /></Form.Item>
            <Form.Item label="Height (cm)" name="heightCm"><InputNumber min={0} style={{ width: 110 }} /></Form.Item>
          </Space>

          <Form.Item label="Source" name="source">
            <Select mode="multiple" allowClear placeholder="Select source(s)"
              options={SOURCE_OPTIONS.map(s => ({ label: s, value: s }))} />
          </Form.Item>

          <Form.Item label="Source Notes" name="sourceNotes">
            <Select mode="tags" allowClear placeholder="Type or select previous entries"
              options={sourceNoteOptions} />
          </Form.Item>

          <Form.Item label="Price">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="currency" noStyle>
                <Select style={{ width: 110 }} placeholder="Currency" allowClear options={CURRENCY_OPTIONS} />
              </Form.Item>
              <Form.Item name="price" noStyle>
                <InputNumber
                  style={{ flex: 1, width: 'calc(100% - 110px)' }}
                  min={0} precision={2} placeholder="0.00"
                  formatter={v => v != null && v !== '' ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={v => v ? Number(v.replace(/,/g, '')) : ('' as unknown as number)}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item label="Owned" name="isOwned" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item label="Remarks" name="remarks"
            extra="URLs typed here appear as clickable links in the detail view.">
            <Input.TextArea rows={3} />
          </Form.Item>

          {/* ── Provenance ── */}
          <Divider orientation="left" style={{ fontSize: 13 }}>Provenance</Divider>
          <Form.List name="provenance">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fields.map(({ key, name }) => (
                  <Space key={key} align="center" style={{ width: '100%' }}>
                    <Form.Item name={[name, 'text']} noStyle
                      rules={[{ required: true, message: 'Enter provenance text' }]}>
                      <Input.TextArea
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        style={{ width: 460 }}
                        placeholder="e.g. Christie's Hong Kong, Lot 123, Spring 2019"
                      />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ color: '#ff4d4f', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}
                    />
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ width: 460 }}
                >
                  Add entry
                </Button>
              </div>
            )}
          </Form.List>

          <Divider orientation="left" style={{ fontSize: 13, marginTop: 20 }}>
            Images — drag to reorder · first image is the cover
          </Divider>
          <ImageUploader value={images} onChange={setImages} />

          {isOwnedWatch && (
            <>
              <Divider orientation="left" style={{ fontSize: 13, marginTop: 20 }}>
                Attachments — invoice, documents, etc.
              </Divider>
              <AttachmentUploader value={attachments} onChange={setAttachments} />
            </>
          )}
        </Form>
      )}
    </Drawer>
  )
}
