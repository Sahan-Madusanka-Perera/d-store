'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Package, Lock, Search } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { getCategoryLabel } from '@/lib/constants'
import { BUNDLE_DISCOUNT_BLURB, BUNDLE_DISCOUNT_MIN_ITEMS } from '@/lib/bundle-discount'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  author?: string
  publisher?: string
  brand?: string
  series?: string
  tags?: string[]
  character_names?: string[]
  stock: number
  image_url?: string  // Keep for backward compatibility
  image_urls?: string[]  // New field for multiple images
  sizes?: string[]
  colors?: string[]
  status?: string
  members_only?: boolean
  discount_eligible?: boolean
  compare_at_price?: number | null
  specifications?: Record<string, any>
}

export default function ProductManager({
  initialProducts,
  initialNavCategories
}: {
  initialProducts?: any[]
  initialNavCategories?: any[]
} = {}) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (!initialProducts) return []
    return initialProducts.map((product: any) => ({
      ...product,
      image_urls: product.image_urls || (product.image_url ? [product.image_url] : [])
    }))
  })
  const [isLoading, setIsLoading] = useState(!initialProducts)
  const [productQuery, setProductQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  // Read the auth token directly from cookies — supabase-js auth methods hang in Turbopack.
  // @supabase/ssr's createBrowserClient stores the session in cookies named
  // sb-{projectRef}-auth-token (or chunked as sb-{projectRef}-auth-token.0, .1, etc.)
  const getAccessToken = (): string | null => {
    try {
      const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('https://', '').split('.')[0]
      const cookiePrefix = `sb-${projectRef}-auth-token`
      const allCookies = document.cookie.split(';').map(c => c.trim())

      // Try single cookie first
      const singleCookie = allCookies.find(c => c.startsWith(`${cookiePrefix}=`))
      if (singleCookie) {
        let value = decodeURIComponent(singleCookie.split('=').slice(1).join('='))
        // @supabase/ssr stores cookies as base64-encoded JSON with "base64-" prefix
        if (value.startsWith('base64-')) {
          value = atob(value.slice(7))
        }
        const parsed = JSON.parse(value)
        return parsed?.access_token || null
      }

      // Try chunked cookies (sb-xxx-auth-token.0, sb-xxx-auth-token.1, etc.)
      const chunks: string[] = []
      for (let i = 0; i < 10; i++) {
        const chunk = allCookies.find(c => c.startsWith(`${cookiePrefix}.${i}=`))
        if (!chunk) break
        chunks.push(decodeURIComponent(chunk.split('=').slice(1).join('=')))
      }
      if (chunks.length > 0) {
        let joined = chunks.join('')
        if (joined.startsWith('base64-')) {
          joined = atob(joined.slice(7))
        }
        const parsed = JSON.parse(joined)
        return parsed?.access_token || null
      }

      return null
    } catch (err) {
      console.error('Failed to read auth token from cookie:', err)
      return null
    }
  }

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    author: '',
    publisher: '',
    brand: '',
    series: '',
    tags: '',
    character_names: '',
    stock: '',
    sizes: '',
    colors: '',
    status: 'available',
    members_only: false,
    discount_eligible: false,
    compare_at_price: '',
    specifications: {} as Record<string, any>,
    images: [] as File[]
  })

  // Every field an admin might reasonably recall a product by — the id included, since
  // that is what order records and support emails quote. Terms are ANDed so a query
  // like "chainsaw viz" narrows instead of widening.
  const visibleProducts = useMemo(() => {
    const terms = productQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return products

    return products.filter(product => {
      const haystack = [
        product.name,
        product.brand,
        product.publisher,
        product.author,
        product.series,
        product.category,
        String(product.id),
        ...(product.tags ?? []),
        ...(product.character_names ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return terms.every(term => haystack.includes(term))
    })
  }, [products, productQuery])

  // Preview images state
  const [previewImages, setPreviewImages] = useState<string[]>([])

  // Autocomplete states
  const [uniqueSeries, setUniqueSeries] = useState<string[]>([])
  const [uniqueTags, setUniqueTags] = useState<string[]>([])
  const [uniqueCharacters, setUniqueCharacters] = useState<string[]>([])
  const [characterSearch, setCharacterSearch] = useState('')
  const [showCharacterSuggestions, setShowCharacterSuggestions] = useState(false)

  // Fetch products and categories
  const fetchProducts = async () => {
    setIsLoading(true)

    // Fire both queries in parallel — they're independent of each other
    const [productsResult, navResult] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase.from('nav_categories').select(`
        *,
        nav_dropdown_items (*)
      `)
    ])

    const { data, error } = productsResult
    const { data: navData } = navResult

    if (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } else {
      // Convert single image_url to image_urls array for backward compatibility
      const processedProducts = data?.map(product => ({
        ...product,
        image_urls: product.image_urls || (product.image_url ? [product.image_url] : [])
      })) || []
      setProducts(processedProducts)

      // Compute unique series and characters for autocomplete
      const seriesSet = new Set<string>()
      const charsSet = new Set<string>()

      data?.forEach(p => {
        if (p.series) seriesSet.add(p.series.trim())
        if (p.character_names && Array.isArray(p.character_names)) {
          p.character_names.forEach((c: string) => charsSet.add(c.trim()))
        }
      })

      const tagSet = new Set<string>();
      
      if (navData) {
        navData.forEach((nav: any) => {
          if (nav.label === 'Series' && Array.isArray(nav.nav_dropdown_items)) {
            nav.nav_dropdown_items.forEach((item: any) => seriesSet.add(item.label.trim()));
          } else if (Array.isArray(nav.nav_dropdown_items)) {
            nav.nav_dropdown_items.forEach((item: any) => tagSet.add(item.label.trim()));
          }
        });
      }

      setUniqueSeries(Array.from(seriesSet).filter(Boolean).sort())
      setUniqueTags(Array.from(tagSet).filter(Boolean).sort())
      setUniqueCharacters(Array.from(charsSet).filter(Boolean).sort())
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (initialProducts) {
      // Server already provided the data — just compute autocomplete values
      const seriesSet = new Set<string>()
      const charsSet = new Set<string>()
      initialProducts.forEach((p: any) => {
        if (p.series) seriesSet.add(p.series.trim())
        if (p.character_names && Array.isArray(p.character_names)) {
          p.character_names.forEach((c: string) => charsSet.add(c.trim()))
        }
      })
      const tagSet = new Set<string>()
      if (initialNavCategories) {
        initialNavCategories.forEach((nav: any) => {
          if (nav.label === 'Series' && Array.isArray(nav.nav_dropdown_items)) {
            nav.nav_dropdown_items.forEach((item: any) => seriesSet.add(item.label.trim()))
          } else if (Array.isArray(nav.nav_dropdown_items)) {
            nav.nav_dropdown_items.forEach((item: any) => tagSet.add(item.label.trim()))
          }
        })
      }
      setUniqueSeries(Array.from(seriesSet).filter(Boolean).sort())
      setUniqueTags(Array.from(tagSet).filter(Boolean).sort())
      setUniqueCharacters(Array.from(charsSet).filter(Boolean).sort())
    } else {
      // No server data — fall back to client-side fetch
      fetchProducts()
    }
  }, [])

  // Handle form input changes
  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSpecChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value
      }
    }))
  }

  // Handle multiple image upload
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const newImages = Array.from(files)
    const currentImages = formData.images

    // Limit to 5 images total
    if (currentImages.length + newImages.length > 5) {
      toast.error('Maximum 5 images allowed per product')
      return
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))

    // Create preview URLs
    const newPreviews = newImages.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...newPreviews])
  }

  // Remove image from upload
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))

    // Clean up preview URL
    if (previewImages[index]) {
      URL.revokeObjectURL(previewImages[index])
    }
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  // Upload multiple images to Supabase Storage
  const uploadImages = async (images: File[]): Promise<string[]> => {
    console.log(`Starting upload of ${images.length} images...`)

    // Read cached session — never await supabase-js auth in Turbopack (it hangs)
    // Read token directly from cookies (supabase-js hangs in Turbopack)
    const accessToken = getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated — please refresh the page and log in again')
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqeuhcdfjxexaxqpxnny.supabase.co'

    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

      console.log(`Uploading image ${index + 1}: ${image.name} as ${fileName}`)

      try {
        const uploadUrl = `${supabaseUrl}/storage/v1/object/product-images/${fileName}`

        // Convert File to ArrayBuffer to prevent mysterious browser/fetch streaming hangs
        const arrayBuffer = await image.arrayBuffer()

        // Create an AbortController for a 60-second timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': image.type || 'image/jpeg',
            'x-upsert': 'false'
          },
          body: arrayBuffer,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Image ${index + 1} upload error response:`, errorText)
          throw new Error(`Upload failed with status ${response.status}: ${errorText}`)
        }

        console.log(`Image ${index + 1} upload native fetch successful.`)
      } catch (err) {
        console.error(`Critical failure during upload of image ${index + 1}:`, err)
        throw err
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      console.log(`Image ${index + 1} uploaded successfully. URL: ${publicUrl}`)
      return publicUrl
    })

    const urls = await Promise.all(uploadPromises)
    console.log('All images uploaded successfully:', urls)
    return urls
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      author: '',
      publisher: '',
      brand: '',
      series: '',
      tags: '',
      character_names: '',
      stock: '',
      sizes: '',
      colors: '',
      status: 'available',
      members_only: false,
      discount_eligible: false,
      compare_at_price: '',
      specifications: {},
      images: []
    })

    // Clean up preview URLs
    previewImages.forEach(url => URL.revokeObjectURL(url))
    setPreviewImages([])
    setCharacterSearch('')
    setShowCharacterSuggestions(false)

    setEditingProduct(null)
    setShowAddForm(false)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    console.log('Form submission started')
    console.log('Specifications being saved:', formData.specifications)

    try {
      let imageUrls: string[] = []

      // Upload new images if any
      if (formData.images.length > 0) {
        console.log('Starting image upload process...')
        imageUrls = await uploadImages(formData.images)
        console.log('Images uploaded successfully:', imageUrls)
      }

      // If editing, combine with existing images
      if (editingProduct?.image_urls && editingProduct.image_urls.length > 0) {
        imageUrls = [...editingProduct.image_urls, ...imageUrls]
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        author: formData.author || null,
        publisher: formData.publisher || null,
        brand: formData.brand || null,
        series: formData.series || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
        character_names: formData.character_names ? formData.character_names.split(',').map(c => c.trim()).filter(Boolean) : null,
        stock: parseInt(formData.stock) || 0,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : null,
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : null,
        status: formData.status || 'available',
        members_only: formData.members_only,
        discount_eligible: formData.discount_eligible,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        specifications: Object.keys(formData.specifications).length > 0 ? formData.specifications : null,
      }

      console.log('Product data to save:', JSON.stringify(productData, null, 2))

      // Read cached session — never await supabase-js auth in Turbopack (it hangs)
      // Read token directly from cookies (supabase-js hangs in Turbopack)
      const accessToken = getAccessToken()
      if (!accessToken) {
        throw new Error('Session expired — please refresh the page and log in again')
      }
      console.log('Session token available, proceeding with REST call...')

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': supabaseAnonKey,
        'Prefer': 'return=representation',
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      let response: Response
      if (editingProduct) {
        console.log('Updating product via REST:', editingProduct.id)
        response = await fetch(
          `${supabaseUrl}/rest/v1/products?id=eq.${editingProduct.id}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify(productData),
            signal: controller.signal,
          }
        )
      } else {
        console.log('Inserting new product via REST')
        response = await fetch(
          `${supabaseUrl}/rest/v1/products`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(productData),
            signal: controller.signal,
          }
        )
      }
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('REST API error:', response.status, errorText)
        throw new Error(`Database operation failed (${response.status}): ${errorText}`)
      }

      const returnedData = await response.json()
      console.log('Database operation successful. Returned:', returnedData)

      // Verify the update actually affected a row
      if (editingProduct && (!returnedData || (Array.isArray(returnedData) && returnedData.length === 0))) {
        throw new Error('Update returned no data — the product may have been deleted.')
      }

      toast.success(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
      resetForm()

      if (editingProduct && Array.isArray(returnedData) && returnedData.length > 0) {
        // Update local state directly instead of re-fetching everything
        const updated = returnedData[0]
        setProducts(prev => prev.map(p =>
          p.id === editingProduct.id
            ? {
                ...updated,
                image_urls: updated.image_urls || (updated.image_url ? [updated.image_url] : [])
              }
            : p
        ))
      } else {
        // For inserts, do a full refresh to get the new product
        fetchProducts()
      }
    } catch (error) {
      console.error('*** ERROR SAVING PRODUCT ***', error)
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.error('Request timed out — please try again')
      } else {
        toast.error(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit product
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      author: product.author || '',
      publisher: product.publisher || '',
      brand: product.brand || '',
      series: product.series || '',
      tags: product.tags?.join(', ') || '',
      character_names: product.character_names?.join(', ') || '',
      stock: product.stock.toString(),
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      status: product.status || 'available',
      members_only: Boolean(product.members_only),
      discount_eligible: Boolean(product.discount_eligible),
      compare_at_price: product.compare_at_price?.toString() || '',
      specifications: product.specifications || {},
      images: []
    })
    setShowAddForm(true)
  }

  // Handle delete product
  const handleDelete = async (productId: number) => {
    try {
      const accessToken = getAccessToken()
      if (!accessToken) throw new Error('Not authenticated — please refresh the page')

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      const response = await fetch(
        `${supabaseUrl}/rest/v1/products?id=eq.${productId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': supabaseAnonKey,
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Delete failed (${response.status}): ${errorText}`)
      }

      toast.success('Product deleted successfully!')
      // Remove from local state instantly instead of re-fetching
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'manga': return 'bg-blue-500 text-white'
      case 'figures': return 'bg-red-500 text-white'
      case 'tshirts': return 'bg-yellow-500 text-black'
      case 'other': return 'bg-teal-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600 mt-1">Manage your store inventory</p>
        </div>
        <Button
          onClick={() => {
            console.log('Add Product button clicked, showAddForm:', showAddForm);
            setShowAddForm(true);
          }}
          className=" hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showAddForm} onOpenChange={(open) => {
        if (!open) resetForm()
        setShowAddForm(open)
      }}>

        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white border border-gray-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-2xl z-[10000]">
          <DialogHeader className="p-6 px-8 border-b border-gray-100 bg-gray-50/80 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-gray-900">
              <Package className="h-6 w-6 text-black" />
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              {editingProduct ? 'Update product information' : 'Fill in the details to add a new product to your inventory'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
            <div className="p-6 px-8 overflow-y-auto flex-1 space-y-8 bg-white">
              {/* Basic Information Section */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-black rounded-sm" />
                  Basic Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="name" className="text-gray-900 font-bold mb-1.5 block">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      placeholder="Enter product name"
                      className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-gray-900 font-bold mb-1.5 block">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black rounded-xl h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-black rounded-xl z-[10001]">
                        <SelectItem value="manga" className="focus:bg-gray-50 focus:text-black cursor-pointer">Manga</SelectItem>
                        <SelectItem value="figures" className="focus:bg-gray-50 focus:text-black cursor-pointer">Figures</SelectItem>
                        <SelectItem value="tshirts" className="focus:bg-gray-50 focus:text-black cursor-pointer">T-Shirts</SelectItem>
                        <SelectItem value="other" className="focus:bg-gray-50 focus:text-black cursor-pointer">Other Collectibles (TCG, etc.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-gray-900 font-bold mb-1.5 block">Product Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black rounded-xl h-11">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-black rounded-xl z-[10001]">
                        <SelectItem value="available" className="focus:bg-gray-50 focus:text-black cursor-pointer">Available</SelectItem>
                        <SelectItem value="coming_soon" className="focus:bg-gray-50 focus:text-black cursor-pointer">Coming Soon</SelectItem>
                        <SelectItem value="pre_order" className="focus:bg-gray-50 focus:text-black cursor-pointer">Pre-order</SelectItem>
                        <SelectItem value="out_of_stock" className="focus:bg-gray-50 focus:text-black cursor-pointer">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-gray-900 font-bold mb-1.5 block">Price (LKR)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                      placeholder="0.00"
                      className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock" className="text-gray-900 font-bold mb-1.5 block">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      required
                      placeholder="0"
                      className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-2 flex items-start justify-between gap-6 rounded-xl border border-gray-200 bg-white p-4">
                    <div>
                      <Label htmlFor="members_only" className="text-gray-900 font-bold mb-1 block">Members Only</Label>
                      <p className="text-sm text-gray-500 font-medium">
                        Hide this listing from logged-out visitors. It stays out of the catalogue, search
                        and recommendations until a visitor signs in.
                      </p>
                    </div>
                    <Switch
                      id="members_only"
                      checked={formData.members_only}
                      onCheckedChange={(checked) => handleInputChange('members_only', checked)}
                      className="mt-1 shrink-0"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-2 flex items-start justify-between gap-6 rounded-xl border border-gray-200 bg-white p-4">
                    <div>
                      <Label htmlFor="discount_eligible" className="text-gray-900 font-bold mb-1 block">Discount Eligible</Label>
                      <p className="text-sm text-gray-500 font-medium">
                        {BUNDLE_DISCOUNT_BLURB}. The listing says so under the price, and the
                        cart applies it once {BUNDLE_DISCOUNT_MIN_ITEMS} eligible items are in
                        the basket — counted across every eligible product, not per listing.
                      </p>
                    </div>
                    <Switch
                      id="discount_eligible"
                      checked={formData.discount_eligible}
                      onCheckedChange={(checked) => handleInputChange('discount_eligible', checked)}
                      className="mt-1 shrink-0"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-2 rounded-xl border border-gray-200 bg-white p-4">
                    <Label htmlFor="compare_at_price" className="text-gray-900 font-bold mb-1 block">
                      Compare-at price <span className="font-medium text-gray-400">(optional)</span>
                    </Label>
                    <p className="text-sm text-gray-500 font-medium mb-3">
                      Shown struck through beside the real price, so a compare-at of 12,500 on a
                      9,500 listing reads as <span className="line-through">Rs. 12,500</span>{' '}
                      Rs. 9,500. Leave empty for no strike-through. Must be higher than the actual
                      price — the database rejects anything lower. Use the RRP or a price this item
                      genuinely sold at; an invented one is misleading pricing.
                    </p>
                    <Input
                      id="compare_at_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compare_at_price}
                      onChange={(e) => handleInputChange('compare_at_price', e.target.value)}
                      placeholder="e.g. 12500"
                      className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-2">
                    <Label htmlFor="description" className="text-gray-900 font-bold mb-1.5 block">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      placeholder="Enter a detailed product description..."
                      className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 resize-none rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Category-Specific Section */}
              {formData.category && (
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 capitalize">
                    <div className="w-2 h-6 bg-blue-600 rounded-sm" />
                    {formData.category} Specifications
                  </h3>

                  {formData.category === 'manga' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="author" className="text-gray-900 font-bold mb-1.5 block">Author</Label>
                          <Input
                            id="author"
                            value={formData.author}
                            onChange={(e) => handleInputChange('author', e.target.value)}
                            placeholder="Author name"
                            className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                          />
                        </div>
                        <div>
                          <Label htmlFor="publisher" className="text-gray-900 font-bold mb-1.5 block">Publisher</Label>
                          <Input
                            id="publisher"
                            value={formData.publisher}
                            onChange={(e) => handleInputChange('publisher', e.target.value)}
                            placeholder="e.g. Viz Media, Kodansha"
                            className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <p className="font-bold text-gray-900 mb-4">Detailed Specifications</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Publication Date</Label>
                            <Input
                              value={formData.specifications.publicationDate || ''}
                              onChange={(e) => handleSpecChange('publicationDate', e.target.value)}
                              placeholder="e.g. March 11, 2025"
                              className="bg-white border-gray-200 focus:border-black rounded-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Language</Label>
                            <Input
                              value={formData.specifications.language || ''}
                              onChange={(e) => handleSpecChange('language', e.target.value)}
                              placeholder="e.g. English"
                              className="bg-white border-gray-200 focus:border-black rounded-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Print Length</Label>
                            <Input
                              value={formData.specifications.printLength || ''}
                              onChange={(e) => handleSpecChange('printLength', e.target.value)}
                              placeholder="e.g. 208 pages"
                              className="bg-white border-gray-200 focus:border-black rounded-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Item Weight</Label>
                            <Input
                              value={formData.specifications.itemWeight || ''}
                              onChange={(e) => handleSpecChange('itemWeight', e.target.value)}
                              placeholder="e.g. 6.5 ounces"
                              className="bg-white border-gray-200 focus:border-black rounded-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Dimensions</Label>
                            <Input
                              value={formData.specifications.dimensions || ''}
                              onChange={(e) => handleSpecChange('dimensions', e.target.value)}
                              placeholder="e.g. 5 x 0.7 x 7.5 inches"
                              className="bg-white border-gray-200 focus:border-black rounded-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">ISBN-10</Label>
                            <Input
                              value={formData.specifications.isbn10 || ''}
                              onChange={(e) => handleSpecChange('isbn10', e.target.value)}
                              placeholder="e.g. 1974751880"
                              className="bg-white border-gray-200 focus:border-black rounded-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">ISBN-13</Label>
                            <Input
                              value={formData.specifications.isbn13 || ''}
                              onChange={(e) => handleSpecChange('isbn13', e.target.value)}
                              placeholder="e.g. 978-1974751884"
                              className="bg-white border-gray-200 focus:border-black rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.category === 'figures' && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="brand" className="text-gray-900 font-bold mb-1.5 block">Brand / Manufacturer</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => handleInputChange('brand', e.target.value)}
                          placeholder="e.g. Bandai Spirits, Good Smile"
                          className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                        />
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <p className="font-bold text-gray-900 mb-4">Detailed Specifications</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Theme</Label>
                            <Input value={formData.specifications.theme || ''} onChange={(e) => handleSpecChange('theme', e.target.value)} placeholder="e.g. Anime" className="bg-white border-gray-200 focus:border-black rounded-lg" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Color</Label>
                            <Input value={formData.specifications.color || ''} onChange={(e) => handleSpecChange('color', e.target.value)} placeholder="e.g. Sukuna" className="bg-white border-gray-200 focus:border-black rounded-lg" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Style</Label>
                            <Input value={formData.specifications.style || ''} onChange={(e) => handleSpecChange('style', e.target.value)} placeholder="e.g. Modern" className="bg-white border-gray-200 focus:border-black rounded-lg" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Item Dimensions</Label>
                            <Input value={formData.specifications.itemDimensions || ''} onChange={(e) => handleSpecChange('itemDimensions', e.target.value)} placeholder="e.g. 4.5 L x 8.8 W" className="bg-white border-gray-200 focus:border-black rounded-lg" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Item Weight</Label>
                            <Input value={formData.specifications.itemWeight || ''} onChange={(e) => handleSpecChange('itemWeight', e.target.value)} placeholder="e.g. 200 Grams" className="bg-white border-gray-200 focus:border-black rounded-lg" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Material Type</Label>
                            <Input value={formData.specifications.materialType || ''} onChange={(e) => handleSpecChange('materialType', e.target.value)} placeholder="e.g. PVC" className="bg-white border-gray-200 focus:border-black rounded-lg" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-semibold mb-1.5 block text-sm">Age Range</Label>
                            <Input value={formData.specifications.ageRange || ''} onChange={(e) => handleSpecChange('ageRange', e.target.value)} placeholder="e.g. 15+" className="bg-white border-gray-200 focus:border-black rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.category === 'tshirts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="sizes" className="text-gray-900 font-bold mb-1.5 block">Available Sizes</Label>
                        <Input
                          id="sizes"
                          value={formData.sizes}
                          onChange={(e) => handleInputChange('sizes', e.target.value)}
                          placeholder="XS, S, M, L, XL, XXL"
                          className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                        />
                        <p className="text-xs text-gray-500 mt-1.5 font-medium">Separate sizes with commas</p>
                      </div>
                      <div>
                        <Label htmlFor="colors" className="text-gray-900 font-bold mb-1.5 block">Available Colors</Label>
                        <Input
                          id="colors"
                          value={formData.colors}
                          onChange={(e) => handleInputChange('colors', e.target.value)}
                          placeholder="Black, White, Red, Blue"
                          className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                        />
                        <p className="text-xs text-gray-500 mt-1.5 font-medium">Separate colors with commas</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Organization & Tagging Section */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-purple-600 rounded-sm" />
                  Organization & Tagging
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="series" className="text-gray-900 font-bold mb-1.5 block">Series Title (e.g. One Piece)</Label>
                    <Input
                      id="series"
                      list="series-list"
                      value={formData.series}
                      onChange={(e) => handleInputChange('series', e.target.value)}
                      placeholder="Series name"
                      className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                    />
                    <datalist id="series-list">
                      {uniqueSeries.map((series, idx) => (
                        <option key={idx} value={series} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <Label htmlFor="tags" className="text-gray-900 font-bold mb-1.5 block">Sub-Category / Tags</Label>
                    <Input
                      id="tags"
                      list="tags-list"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g. Action Figures, Gundam Kits, Shonen"
                      className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                    />
                    <datalist id="tags-list">
                      {uniqueTags.map((tag, idx) => (
                        <option key={idx} value={tag} />
                      ))}
                    </datalist>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">Select from your nav categories, or type new ones separated by commas</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="relative">
                    <Label htmlFor="character_names" className="text-gray-900 font-bold mb-1.5 block flex justify-between items-center">
                      <span>Character Names</span>
                      {formData.character_names && (
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {formData.character_names.split(',').filter(c => c.trim()).length} added
                        </span>
                      )}
                    </Label>
                    <Input
                      id="character_names"
                      value={formData.character_names}
                      onChange={(e) => {
                        handleInputChange('character_names', e.target.value);

                        // Extract just the latest typing part to filter suggestions
                        const parts = e.target.value.split(',');
                        const lastPart = parts[parts.length - 1].trim();
                        setCharacterSearch(lastPart);
                        setShowCharacterSuggestions(lastPart.length > 0);
                      }}
                      onFocus={(e) => {
                        const parts = e.target.value.split(',');
                        const lastPart = parts[parts.length - 1].trim();
                        setCharacterSearch(lastPart);
                        setShowCharacterSuggestions(true);
                      }}
                      onBlur={() => {
                        // Delay hiding slightly to allow clicks on suggestions
                        setTimeout(() => setShowCharacterSuggestions(false), 200);
                      }}
                      placeholder="e.g. Luffy, Zoro"
                      className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                    />

                    {/* Character Autocomplete Dropdown */}
                    {showCharacterSuggestions && uniqueCharacters.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                        {uniqueCharacters
                          .filter(char => char.toLowerCase().includes(characterSearch.toLowerCase()))
                          .filter(char => {
                            // Don't show characters already explicitly in the input list
                            const currentChars = formData.character_names.split(',').map(c => c.trim().toLowerCase());
                            return !currentChars.includes(char.toLowerCase());
                          })
                          .map((char, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm focus:outline-none focus:bg-gray-50 border-b border-gray-50 last:border-b-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const currentParts = formData.character_names.split(',');
                                // Replace the last (incomplete) part with the selected character
                                if (currentParts.length > 0) {
                                  currentParts[currentParts.length - 1] = ' ' + char;
                                } else {
                                  currentParts.push(char);
                                }

                                // Clean up and build the new string
                                const newValue = currentParts
                                  .map(p => p.trim())
                                  .filter(Boolean)
                                  .join(', ') + ', ';

                                handleInputChange('character_names', newValue);

                                // Keep focus but hide suggestions momentarily
                                document.getElementById('character_names')?.focus();
                                setCharacterSearch('');
                                setShowCharacterSuggestions(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{char}</span>
                                <Plus className="h-3 w-3 text-gray-400 ml-auto" />
                              </div>
                            </button>
                          ))}
                        {uniqueCharacters.filter(char => char.toLowerCase().includes(characterSearch.toLowerCase()) && !formData.character_names.split(',').map(c => c.trim().toLowerCase()).includes(char.toLowerCase())).length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-500 italic">No matching new characters found.</div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1.5 font-medium">Separate characters with commas. Click suggestions to quick-add.</p>
                  </div>
                </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-rose-500 rounded-sm" />
                  Media & Images
                </h3>
              {/* Multiple Image Upload */}
              <div className="space-y-4">
                <Label className="text-gray-900 font-bold mb-1.5 block">Product Images (Max 5)</Label>

                {/* Current Images (for editing) */}
                {editingProduct?.image_urls && editingProduct.image_urls.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-3 font-medium">Current Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {editingProduct.image_urls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={url}
                              alt={`Current ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              // Remove image from existing images
                              const updatedUrls = editingProduct.image_urls?.filter((_, i) => i !== index)
                              setEditingProduct({ ...editingProduct, image_urls: updatedUrls })
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:bg-white hover:border-black transition-all group relative overflow-hidden transition-colors">
                  <div className="text-center relative z-10">
                    <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-black transition-all duration-300 shadow-sm">
                      <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-black transition-colors" />
                    </div>
                    <div>
                      <Label htmlFor="images" className="cursor-pointer inline-flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors">
                          Click to select files
                        </span>
                        <span className="text-xs text-gray-500 mt-2 block font-medium">
                          PNG, JPG, GIF up to 10MB each. Maximum 5 images.
                        </span>
                        <Input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="hidden"
                        />
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Preview New Images */}
                {previewImages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-3 font-medium">New Images to Upload:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="p-6 px-8 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3 shrink-0">
              <Button type="button" variant="outline" onClick={resetForm} className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl h-11 px-6">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-black hover:bg-gray-900 border-0 text-white transition-all duration-300 rounded-xl font-bold h-11 px-8 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingProduct ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({productQuery ? `${visibleProducts.length} of ${products.length}` : products.length})
          </CardTitle>

          {/* Filters as you type — no submit button, because a search that only runs on
              click is slower than scanning the table it was meant to replace. */}
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <Input
              type="search"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Search name, brand, series, SKU…"
              aria-label="Search products"
              className="h-10 border-gray-200 bg-white pl-9 pr-9 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            />
            {productQuery && (
              <button
                type="button"
                onClick={() => setProductQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">Get started by adding your first product.</p>
              <Button onClick={() => setShowAddForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nothing matches “{productQuery}”
              </h3>
              <p className="mt-2 text-gray-500">Try a shorter term, or check the spelling.</p>
              <Button variant="outline" onClick={() => setProductQuery('')} className="mt-4">
                Clear search
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Product</TableHead>
                    <TableHead className="w-[100px]">Category</TableHead>
                    <TableHead className="w-[100px]">Price</TableHead>
                    <TableHead className="w-[90px]">Stock</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="w-[160px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image_urls?.[0] ? (
                              <Image
                                src={product.image_urls[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            {product.image_urls && product.image_urls.length > 1 && (
                              <Badge
                                variant="secondary"
                                className="absolute -top-1 -right-1 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                              >
                                +{product.image_urls.length - 1}
                              </Badge>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 truncate">{product.name}</span>
                              {product.members_only && (
                                <Badge className="shrink-0 gap-1 bg-gray-900 text-white border-0 text-[11px] font-semibold">
                                  <Lock className="h-3 w-3" />
                                  Members Only
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{product.description}</div>
                            {product.author && (
                              <div className="text-xs text-gray-400 truncate">by {product.author}</div>
                            )}
                            {product.brand && (
                              <div className="text-xs text-gray-400 truncate">{product.brand}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(product.category)}>
                          {getCategoryLabel(product.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.stock === 0 ? 'destructive' : product.stock < 10 ? 'secondary' : 'default'}
                          className={
                            product.stock === 0 ? 'bg-red-100 text-red-800' :
                              product.stock < 10 ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                          }
                        >
                          {product.stock} units
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.status === 'coming_soon' ? 'bg-blue-100 text-blue-800' :
                              product.status === 'pre_order' ? 'bg-violet-100 text-violet-800' :
                                product.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                                  product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {product.status === 'coming_soon' ? 'Coming Soon' :
                            product.status === 'pre_order' ? 'Pre-order' :
                              product.status === 'out_of_stock' ? 'Out of Stock' :
                                product.stock > 0 ? 'Available' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the product "{product.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}