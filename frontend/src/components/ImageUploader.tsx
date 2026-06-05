import { useState } from 'react'
import { Upload, Button, Spin, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { imagesApi } from '../api/images'

export interface ManagedImage {
  id: number
  url: string
  isMain: boolean
}

interface SortableImageProps {
  image: ManagedImage
  index: number
  onDelete: () => void
}

function SortableImage({ image, index, onDelete }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(image.id),
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative',
        width: 100,
        flexShrink: 0,
      }}
    >
      {/* Drag handle covers the image */}
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      >
        <img
          src={image.url}
          style={{
            width: 100,
            height: 100,
            objectFit: 'cover',
            display: 'block',
            borderRadius: 6,
            border: index === 0 ? '2px solid #1677ff' : '2px solid transparent',
          }}
          draggable={false}
        />
      </div>

      {/* Cover badge on first image */}
      {index === 0 && (
        <div style={{
          position: 'absolute',
          top: 4,
          left: 4,
          background: '#1677ff',
          color: '#fff',
          fontSize: 10,
          fontWeight: 600,
          padding: '1px 5px',
          borderRadius: 3,
          pointerEvents: 'none',
          letterSpacing: 0.3,
        }}>
          COVER
        </div>
      )}

      {/* Delete button */}
      <Button
        size="small"
        danger
        icon={<DeleteOutlined />}
        onClick={onDelete}
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          padding: '0 4px',
          minWidth: 0,
        }}
      />
    </div>
  )
}

interface Props {
  value?: ManagedImage[]
  onChange?: (images: ManagedImage[]) => void
}

export default function ImageUploader({ value = [], onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [messageApi, ctx] = message.useMessage()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const notify = (images: ManagedImage[]) =>
    onChange?.(images.map((img, i) => ({ ...img, isMain: i === 0 })))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex(img => String(img.id) === active.id)
      const newIndex = value.findIndex(img => String(img.id) === over.id)
      notify(arrayMove(value, oldIndex, newIndex))
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await imagesApi.upload(file)
      notify([...value, { id: result.id, url: result.url, isMain: false }])
    } catch {
      messageApi.error('Upload failed')
    } finally {
      setUploading(false)
    }
    return false
  }

  const handleDelete = async (id: number) => {
    try {
      await imagesApi.delete(id)
      notify(value.filter(img => img.id !== id))
    } catch {
      messageApi.error('Delete failed')
    }
  }

  return (
    <>
      {ctx}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={value.map(img => String(img.id))}
          strategy={rectSortingStrategy}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {value.map((img, index) => (
              <SortableImage
                key={img.id}
                image={img}
                index={index}
                onDelete={() => handleDelete(img.id)}
              />
            ))}

            <Upload accept="image/*" showUploadList={false} beforeUpload={handleUpload} multiple>
              <div style={{
                width: 100,
                height: 100,
                border: '1px dashed #d9d9d9',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: '#fafafa',
              }}>
                {uploading
                  ? <Spin size="small" />
                  : <PlusOutlined style={{ fontSize: 20, color: '#999' }} />}
                <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>Upload</div>
              </div>
            </Upload>
          </div>
        </SortableContext>
      </DndContext>
    </>
  )
}
