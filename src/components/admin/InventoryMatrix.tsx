'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react'
import { productMatchesSearch } from '@/lib/product-search'

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
  description?: string
  author?: string
  brand?: string
  series?: string
  tags?: string[]
  character_names?: string[]
}

// Columns the in-memory matcher reads — must cover every field in SEARCH_SCOPES
const MATCH_COLUMNS = 'id, category, name, description, author, brand, series, tags, character_names'

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

// Resolve which product category a nav link is scoped to. `/products` means "everything".
function getCategoryScope(subHref: string, parentHref: string): string | null {
  const basePath = subHref.split('?')[0].replace(/^\//, '')
  const parentPath = parentHref.split('?')[0].replace(/^\//, '')
  if (basePath && basePath !== 'products') return basePath
  if (parentPath && parentPath !== 'products') return parentPath
  return null
}

// The products a nav link actually lands the customer on. This calls the same matcher
// the storefront query is built from, so these counts equal what the page will show.
function productsForSub(
  sub: NavDropdownItem,
  products: ProductSlim[],
  parentHref: string,
  siblings: NavDropdownItem[]
): ProductSlim[] {
  const searchTerm = getSearchTerm(sub.href)
  const categoryScope = getCategoryScope(sub.href, parentHref)
  const scoped = categoryScope ? products.filter(p => p.category === categoryScope) : products

  if (!searchTerm) {
    // No search param → the link opens the bare category page. Treat it as the catch-all:
    // whatever no sibling with a search term claims.
    const claiming = siblings.filter(s => s.id !== sub.id && getSearchTerm(s.href))
    return scoped.filter(p => !claiming.some(sib => matchesSub(p, sib, parentHref)))
  }

  return scoped.filter(p => matchesSub(p, sub, parentHref))
}

function matchesSub(p: ProductSlim, sub: NavDropdownItem, parentHref: string): boolean {
  const searchTerm = getSearchTerm(sub.href)
  if (!searchTerm) return false
  const categoryScope = getCategoryScope(sub.href, parentHref)
  // Sitewide links (/products?search=…) let a category synonym widen; scoped pages are
  // already filtered to one category, so widening there would be a no-op.
  return productMatchesSearch(p, searchTerm, categoryScope ?? 'all', categoryScope === null)
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
            .select(MATCH_COLUMNS)
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

        const subCounts = subs.map(sub => ({
          sub,
          products: productsForSub(sub, products, nav.href, subs),
        }))

        // Products in this category that no subcategory link would ever show. Without this
        // row the sub-counts silently fail to add up to the category total — which is how
        // untagged products stay invisible. A sub with no search term is already a
        // catch-all, so it absorbs them and this row is unnecessary.
        const scopeForNav = categoryKey ? products.filter(p => p.category === categoryKey) : products
        const hasCatchAll = subs.some(sub => !getSearchTerm(sub.href))
        const claimed = new Set(subCounts.flatMap(({ products: matched }) => matched.map(p => p.id)))
        const unassigned = hasCatchAll ? [] : scopeForNav.filter(p => !claimed.has(p.id))

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
                {subCounts.map(({ sub, products: matched }) => (
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
                      matched.length > 0
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gray-50 text-gray-300'
                    }`}>
                      {matched.length}
                    </span>
                  </div>
                ))}

                {unassigned.length > 0 && (
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-amber-50/60 hover:bg-amber-50 transition-colors group"
                    title="These products are in the category but match no subcategory link, so customers can only reach them from the main category page. Tag them to file them under a subcategory."
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                      <span className="text-sm text-amber-700 font-medium">
                        Unassigned
                      </span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {unassigned.length}
                    </span>
                  </div>
                )}
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
