'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface NavDropdownItem {
  id: number
  label: string
  href: string
  sort_order: number
}

interface NavCategory {
  id: number
  label: string
  href: string
  icon_name: string
  sort_order: number
  nav_dropdown_items?: NavDropdownItem[]
}

interface ProductSlim {
  id: number
  category: string
  name: string
  series?: string
  tags?: string[]
}

interface InventoryMatrixProps {
  initialProducts: any[]
  initialNavCategories: NavCategory[]
}

// Dynamic color palette
const COLORS = [
  '#E63946', '#457B9D', '#1D3557', '#2A9D8F', '#E9C46A',
  '#F4A261', '#264653', '#6D6875', '#D4A373', '#588157',
]

// Extract search term from an href like "/products?search=One+Piece" → "One Piece"
function getSearchTerm(href: string): string | null {
  try {
    const url = new URL(href, 'http://localhost')
    const search = url.searchParams.get('search')
    return search ? search.replace(/\+/g, ' ') : null
  } catch {
    return null
  }
}

// Check if a product matches a specific subcategory by tag or name/series
function productMatchesSub(p: ProductSlim, subLabel: string, searchTerm: string | null): boolean {
  const label = subLabel.toLowerCase().trim()
  const term = (searchTerm || '').toLowerCase().trim()

  // Tag match: product's tags contain the subcategory label
  if (p.tags && Array.isArray(p.tags)) {
    if (p.tags.some(t => {
      const tag = t.toLowerCase().trim()
      return tag === label || (term && tag === term)
    })) return true
  }

  // Name/series match
  if (term) {
    const name = p.name?.toLowerCase() || ''
    const series = p.series?.toLowerCase() || ''
    if (name.includes(term) || series.includes(term)) return true
    if (label !== term && (name.includes(label) || series.includes(label))) return true
  }
  return false
}

// Count products for a subcategory.
// - Subs WITH a search param (e.g. "?search=Anime") → direct tag/name matches only.
// - Subs WITHOUT a search param (e.g. "Other" → /figures) → products not claimed by any sibling.
function countSubcategoryProducts(
  sub: NavDropdownItem,
  products: ProductSlim[],
  parentHref: string,
  siblings: NavDropdownItem[]
): number {
  const basePath = sub.href.split('?')[0].replace(/^\//, '')
  const parentPath = parentHref.split('?')[0].replace(/^\//, '')
  const searchTerm = getSearchTerm(sub.href)

  // Scope to parent category
  const categoryScope = (basePath && basePath !== 'products') ? basePath
    : (parentPath && parentPath !== 'products') ? parentPath
    : null
  const scoped = categoryScope
    ? products.filter(p => p.category === categoryScope)
    : products

  if (!searchTerm) {
    // No search param → this is a catch-all. Count products not claimed by any sibling that HAS a search term.
    const siblingsWithSearch = siblings.filter(s => s.id !== sub.id && getSearchTerm(s.href))
    return scoped.filter(p =>
      !siblingsWithSearch.some(sib => productMatchesSub(p, sib.label, getSearchTerm(sib.href)))
    ).length
  }

  // Has search param → ONLY count direct tag/name matches. No fallback.
  return scoped.filter(p => productMatchesSub(p, sub.label, searchTerm)).length
}

export default function InventoryMatrix({ initialProducts, initialNavCategories }: InventoryMatrixProps) {
  const [products, setProducts] = useState<ProductSlim[]>(initialProducts)
  const [navCategories, setNavCategories] = useState<NavCategory[]>(initialNavCategories)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    const navChannel = supabase
      .channel('inventory-nav')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nav_categories' },
        async () => {
          const { data } = await supabase
            .from('nav_categories')
            .select('*, nav_dropdown_items(id, label, href, sort_order)')
            .order('sort_order')
          if (data) setNavCategories(data)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nav_dropdown_items' },
        async () => {
          const { data } = await supabase
            .from('nav_categories')
            .select('*, nav_dropdown_items(id, label, href, sort_order)')
            .order('sort_order')
          if (data) setNavCategories(data)
        }
      )
      .subscribe()

    const productsChannel = supabase
      .channel('inventory-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const { data } = await supabase
            .from('products')
            .select('id, category, name, series, tags')
          if (data) setProducts(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(navChannel)
      supabase.removeChannel(productsChannel)
    }
  }, [])

  const getCategoryKey = (href: string): string | null => {
    const path = href.split('?')[0].replace(/^\//, '')
    return path && path !== 'products' ? path : null
  }

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const sorted = [...navCategories].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-1">
      {sorted.map((nav, index) => {
        const categoryKey = getCategoryKey(nav.href)
        const count = categoryKey
          ? products.filter((p: any) => p.category === categoryKey).length
          : null
        const color = COLORS[index % COLORS.length]
        const subs = nav.nav_dropdown_items?.sort((a, b) => a.sort_order - b.sort_order) || []
        const hasSubs = subs.length > 0
        const isExpanded = expanded.has(nav.id)

        return (
          <div key={nav.id}>
            {/* Main category row */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg transition-colors border border-transparent cursor-pointer
                ${hasSubs ? 'hover:bg-gray-50 hover:border-gray-200' : 'hover:bg-gray-50 hover:border-gray-200'}
                ${isExpanded ? 'bg-gray-50/80 border-gray-100' : ''}`}
              onClick={() => hasSubs && toggleExpand(nav.id)}
            >
              <div className="flex items-center gap-3">
                {hasSubs ? (
                  isExpanded
                    ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <div className="w-3.5" />
                )}
                <div
                  className="w-3 h-3.5 rounded-sm shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">{nav.label}</span>
                  {hasSubs && (
                    <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {subs.length}
                    </span>
                  )}
                </div>
              </div>
              {count !== null ? (
                <Badge variant="outline" className="font-mono text-sm shadow-sm">
                  {count}
                </Badge>
              ) : (
                <Badge variant="outline" className="font-mono text-sm shadow-sm text-gray-400">
                  —
                </Badge>
              )}
            </div>

            {/* Subcategories (expanded) */}
            {isExpanded && hasSubs && (
              <div className="ml-6 pl-4 border-l-2 border-gray-100 space-y-0.5 py-1">
                {subs.map((sub) => {
                  const subCount = countSubcategoryProducts(sub, products, nav.href, subs)
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: color, opacity: 0.6 }}
                        />
                        <span className="text-sm text-gray-600 font-medium group-hover:text-gray-800 transition-colors">
                          {sub.label}
                        </span>
                      </div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                        subCount > 0
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-gray-50 text-gray-300'
                      }`}>
                        {subCount}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {sorted.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          No categories configured yet
        </div>
      )}
    </div>
  )
}
