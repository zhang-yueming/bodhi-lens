import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Select, Input, Space, Button, Spin, Empty, Typography } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Converter } from 'opencc-js'
import { itemsApi } from '../api/items'
import ItemDrawer from '../components/ItemDrawer'
import type { Item, Material } from '../types'
import { PERIOD_OPTIONS, SOURCE_OPTIONS } from '../types'

// Created once at module load — expensive to initialise
const toSimplified = Converter({ from: 'tw', to: 'cn' })
const toTraditional = Converter({ from: 'cn', to: 'tw' })

function itemMatchesSearch(item: Item, term: string): boolean {
  if (!term) return true
  const lower = term.toLowerCase()
  // Expand to both script forms so user can type either
  const asSimp = toSimplified(lower)
  const asTrad = toTraditional(lower)
  const blob = [
    item.customName,
    item.period,
    item.source,
    item.sourceNotes,
    item.remarks,
    item.material === 'BRONZE' ? 'bronze' : 'stone',
  ].filter(Boolean).join(' ').toLowerCase()
  return blob.includes(lower) || blob.includes(asSimp) || blob.includes(asTrad)
}

export default function CatalogPage() {
  const [materialFilter, setMaterialFilter] = useState<Material | undefined>()
  const [periodFilter, setPeriodFilter] = useState<string | undefined>()
  const [sourceFilter, setSourceFilter] = useState<string | undefined>()
  const [ownedFilter, setOwnedFilter] = useState<boolean | undefined>()
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [drawerMode, setDrawerMode] = useState<'detail' | 'create'>('detail')

  // Debounce search 300 ms
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Always fetch everything — all filtering is client-side
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.list(),
  })

  const filtered = useMemo(() => {
    let r = items
    if (materialFilter)        r = r.filter(i => i.material === materialFilter)
    if (periodFilter)          r = r.filter(i => i.period?.split(',').includes(periodFilter))
    if (sourceFilter)          r = r.filter(i => i.source?.split(',').includes(sourceFilter))
    if (ownedFilter !== undefined) r = r.filter(i => i.isOwned === ownedFilter)
    if (searchTerm)            r = r.filter(i => itemMatchesSearch(i, searchTerm))
    return r
  }, [items, materialFilter, periodFilter, sourceFilter, searchTerm])

  const openDetail = (item: Item) => {
    setSelectedId(item.id)
    setDrawerMode('detail')
    setDrawerOpen(true)
  }

  const openCreate = () => {
    setSelectedId(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const reset = () => {
    setMaterialFilter(undefined)
    setPeriodFilter(undefined)
    setSourceFilter(undefined)
    setOwnedFilter(undefined)
    setSearchInput('')
    setSearchTerm('')
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Buddhist Art Catalog</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Item</Button>
      </div>

      <Space wrap style={{ marginBottom: 20 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder="Search remarks, notes, name… (中文 / 繁體 / English)"
          style={{ width: 320 }}
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          allowClear
        />
        <Select
          placeholder="Material"
          allowClear
          style={{ width: 120 }}
          value={materialFilter}
          onChange={v => setMaterialFilter(v as Material | undefined)}
          options={[
            { label: 'Bronze', value: 'BRONZE' },
            { label: 'Stone', value: 'STONE' },
          ]}
        />
        <Select
          placeholder="Period"
          allowClear
          style={{ width: 180 }}
          value={periodFilter}
          onChange={v => setPeriodFilter(v)}
          options={PERIOD_OPTIONS.map(p => ({ label: p, value: p }))}
        />
        <Select
          placeholder="Source"
          allowClear
          style={{ width: 180 }}
          value={sourceFilter}
          onChange={v => setSourceFilter(v)}
          options={SOURCE_OPTIONS.map(s => ({ label: s, value: s }))}
        />
        <Select
          placeholder="Owned"
          allowClear
          style={{ width: 120 }}
          value={ownedFilter}
          onChange={v => setOwnedFilter(v)}
          options={[
            { label: 'Owned', value: true },
            { label: 'Not Owned', value: false },
          ]}
        />
        <Button onClick={reset}>Reset</Button>
      </Space>

      {isLoading ? (
        <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 80 }} />
      ) : filtered.length === 0 ? (
        <Empty description={items.length === 0 ? 'No items yet' : 'No results'} style={{ marginTop: 80 }} />
      ) : (
        <div style={{ columns: '220px', columnGap: '10px' }}>
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => openDetail(item)}
              style={{
                breakInside: 'avoid',
                marginBottom: 10,
                cursor: 'pointer',
                borderRadius: 6,
                overflow: 'hidden',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {item.mainImage ? (
                <img src={item.mainImage.url} alt="" style={{ width: '100%', display: 'block' }} />
              ) : (
                <div style={{
                  paddingTop: '100%',
                  background: '#f0ebe1',
                  position: 'relative',
                  borderRadius: 6,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#bbb', fontSize: 13,
                  }}>
                    No image
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ItemDrawer
        open={drawerOpen}
        itemId={selectedId}
        initialMode={drawerMode}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
