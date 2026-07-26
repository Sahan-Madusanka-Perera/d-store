'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lock, Globe, Search, X, CheckCheck, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getCategoryLabel } from '@/lib/constants'

interface VisibilityProduct {
  id: number
  name: string
  category: string
  price: number
  image_url?: string
  image_urls?: string[]
  members_only?: boolean
}

type VisibilityFilter = 'all' | 'public' | 'members'

export default function VisibilityManager({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState<VisibilityProduct[]>(
    () => (initialProducts || []).map(p => ({ ...p, members_only: Boolean(p.members_only) }))
  )
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [visibility, setVisibility] = useState<VisibilityFilter>('all')
  const [isSaving, setIsSaving] = useState(false)

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category))).sort(),
    [products]
  )

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return products.filter(p => {
      if (category !== 'all' && p.category !== category) return false
      if (visibility === 'public' && p.members_only) return false
      if (visibility === 'members' && !p.members_only) return false
      if (term && !p.name.toLowerCase().includes(term)) return false
      return true
    })
  }, [products, search, category, visibility])

  const membersOnlyCount = useMemo(() => products.filter(p => p.members_only).length, [products])

  // Selection can outlive a filter change, so only count what the user can currently see.
  const visibleSelectedCount = filtered.filter(p => selected.has(p.id)).length
  const allVisibleSelected = filtered.length > 0 && visibleSelectedCount === filtered.length

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllVisible = () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allVisibleSelected) filtered.forEach(p => next.delete(p.id))
      else filtered.forEach(p => next.add(p.id))
      return next
    })
  }

  const applyVisibility = async (membersOnly: boolean, ids?: number[]) => {
    const targetIds = ids ?? [...selected]
    if (targetIds.length === 0) return

    // Optimistic — the grid is the whole point of this screen, so it should feel instant.
    const previous = products
    setProducts(prev =>
      prev.map(p => (targetIds.includes(p.id) ? { ...p, members_only: membersOnly } : p))
    )
    setIsSaving(true)

    try {
      const res = await fetch('/api/admin/products/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: targetIds, membersOnly }),
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error || `Request failed (${res.status})`)
      }

      const { updated } = await res.json()
      toast.success(
        membersOnly
          ? `${updated} listing${updated === 1 ? '' : 's'} hidden from guests`
          : `${updated} listing${updated === 1 ? '' : 's'} made public`
      )
      if (!ids) setSelected(new Set())
    } catch (error) {
      setProducts(previous)
      toast.error(`Failed to update visibility: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(price)

  const imageFor = (p: VisibilityProduct) => p.image_urls?.[0] || p.image_url || null

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="font-mono text-sm py-1.5 px-3">
          <Globe className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
          {products.length - membersOnlyCount} public
        </Badge>
        <Badge variant="outline" className="font-mono text-sm py-1.5 px-3">
          <Lock className="h-3.5 w-3.5 mr-1.5 text-gray-900" />
          {membersOnlyCount} members only
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name..."
            className="pl-9 bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl h-11"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-52 bg-white border-gray-200 rounded-xl h-11">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-xl">
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{getCategoryLabel(c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={visibility} onValueChange={v => setVisibility(v as VisibilityFilter)}>
          <SelectTrigger className="w-full sm:w-52 bg-white border-gray-200 rounded-xl h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-xl">
            <SelectItem value="all">All visibility</SelectItem>
            <SelectItem value="public">Public only</SelectItem>
            <SelectItem value="members">Members only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar — sticky so it stays reachable while scrolling a long grid */}
      <div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/95 backdrop-blur px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleAllVisible}
            disabled={filtered.length === 0}
            className="rounded-lg font-semibold"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            {allVisibleSelected ? 'Deselect all' : `Select all ${filtered.length}`}
          </Button>
          <span className="text-sm font-medium text-gray-500">
            {selected.size > 0 ? `${selected.size} selected` : 'Nothing selected'}
          </span>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear selection</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => applyVisibility(true)}
            disabled={selected.size === 0 || isSaving}
            className="rounded-lg font-bold bg-gray-900 hover:bg-black text-white"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Lock className="h-4 w-4 mr-1.5" />}
            Make members only
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => applyVisibility(false)}
            disabled={selected.size === 0 || isSaving}
            className="rounded-lg font-bold"
          >
            <Globe className="h-4 w-4 mr-1.5" />
            Make public
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center">
          <ImageIcon className="h-10 w-10 text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">No products match these filters</p>
          <p className="text-sm text-gray-400 mt-1">Try clearing the search or switching category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(product => {
            const isSelected = selected.has(product.id)
            const image = imageFor(product)

            return (
              <div
                key={product.id}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => toggleOne(product.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleOne(product.id)
                  }
                }}
                className={`group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'border-black shadow-lg'
                    : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                }`}
              >
                <div className="relative aspect-square bg-gray-100">
                  {image ? (
                    <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 20vw" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    </div>
                  )}

                  {/* Selection tick */}
                  <div
                    className={`absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                      isSelected
                        ? 'border-black bg-black text-white'
                        : 'border-white/80 bg-black/20 text-transparent group-hover:bg-black/40'
                    }`}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </div>

                  {product.members_only && (
                    <Badge className="absolute top-2 right-2 gap-1 border-0 bg-gray-900 text-[10px] font-bold text-white">
                      <Lock className="h-2.5 w-2.5" />
                      Members
                    </Badge>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{product.name}</p>
                  <p className="text-xs font-medium text-gray-400">{getCategoryLabel(product.category)}</p>
                  <p className="mt-auto pt-1 text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                </div>

                {/* Per-product flip, for when selecting is overkill */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    applyVisibility(!product.members_only, [product.id])
                  }}
                  disabled={isSaving}
                  className={`border-t px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                    product.members_only
                      ? 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  {product.members_only ? 'Make public' : 'Make members only'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
