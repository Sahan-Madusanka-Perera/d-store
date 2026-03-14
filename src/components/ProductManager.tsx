'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Package } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

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
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

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
    images: [] as File[]
  })

  // Preview images state
  const [previewImages, setPreviewImages] = useState<string[]>([])

  // Autocomplete states
  const [uniqueSeries, setUniqueSeries] = useState<string[]>([])
  const [uniqueCharacters, setUniqueCharacters] = useState<string[]>([])
  const [characterSearch, setCharacterSearch] = useState('')
  const [showCharacterSuggestions, setShowCharacterSuggestions] = useState(false)

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

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

      setUniqueSeries(Array.from(seriesSet).filter(Boolean).sort())
      setUniqueCharacters(Array.from(charsSet).filter(Boolean).sort())
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle form input changes
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
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

    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

      console.log(`Uploading image ${index + 1}: ${image.name} as ${fileName}`)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error(`Image ${index + 1} upload error:`, uploadError)
        throw new Error(`Image ${index + 1} upload failed: ${uploadError.message}`)
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
    console.log('Form data:', formData)
    console.log('Number of images to upload:', formData.images.length)

    try {
      let imageUrls: string[] = []

      // Upload new images if any
      if (formData.images.length > 0) {
        console.log('Starting image upload process...')
        imageUrls = await uploadImages(formData.images)
        console.log('Images uploaded successfully:', imageUrls)
      } else {
        console.log('No images to upload')
      }

      // If editing, combine with existing images
      if (editingProduct?.image_urls) {
        console.log('Combining with existing images:', editingProduct.image_urls)
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
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : null,
        character_names: formData.character_names ? formData.character_names.split(',').map(c => c.trim()) : null,
        stock: parseInt(formData.stock),
        // Support both single image_url and multiple image_urls for backward compatibility
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : null,
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : null,
        status: formData.status || 'available',
      }

      console.log('Preparing to save product data:', productData)

      let result
      if (editingProduct) {
        console.log('Updating existing product:', editingProduct.id)
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
      } else {
        console.log('Inserting new product')
        result = await supabase
          .from('products')
          .insert([productData])
      }

      console.log('Database operation result:', result)

      if (result.error) {
        console.error('Database error:', result.error)
        throw new Error(result.error.message)
      }

      toast.success(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      images: []
    })
    setShowAddForm(true)
  }

  // Handle delete product
  const handleDelete = async (productId: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success('Product deleted successfully!')
      fetchProducts()
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
          className="bg-brand-gradient hover:opacity-90 shadow-brand"
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

        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden z-50 bg-white border border-gray-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-2xl">
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
            <div className="p-6 px-8 overflow-y-auto flex-1 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-5">
                  <div>
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
                      <SelectContent className="bg-white border-gray-200 text-black rounded-xl">
                        <SelectItem value="manga" className="focus:bg-gray-50 focus:text-black cursor-pointer">Manga</SelectItem>
                        <SelectItem value="figures" className="focus:bg-gray-50 focus:text-black cursor-pointer">Figures</SelectItem>
                        <SelectItem value="tshirts" className="focus:bg-gray-50 focus:text-black cursor-pointer">T-Shirts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-gray-900 font-bold mb-1.5 block">Product Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black rounded-xl h-11">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-black rounded-xl">
                        <SelectItem value="available" className="focus:bg-gray-50 focus:text-black cursor-pointer">Available</SelectItem>
                        <SelectItem value="coming_soon" className="focus:bg-gray-50 focus:text-black cursor-pointer">Coming Soon</SelectItem>
                        <SelectItem value="pre_order" className="focus:bg-gray-50 focus:text-black cursor-pointer">Pre-order</SelectItem>
                        <SelectItem value="out_of_stock" className="focus:bg-gray-50 focus:text-black cursor-pointer">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">Controls how the product appears to customers</p>
                  </div>
                </div>

                {/* Category-specific fields */}
                <div className="space-y-5">
                  {formData.category === 'manga' && (
                    <div className="grid grid-cols-2 gap-4">
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
                  )}

                  {formData.category === 'figures' && (
                    <div>
                      <Label htmlFor="brand" className="text-gray-900 font-bold mb-1.5 block">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="Brand name"
                        className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                      />
                    </div>
                  )}

                  {formData.category === 'tshirts' && (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-900 font-bold mb-1.5 block">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Enter product description..."
                  className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 resize-none rounded-xl"
                />
              </div>

              {/* Tagging & Classification (Global/Optional) */}
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
                    <Label htmlFor="tags" className="text-gray-900 font-bold mb-1.5 block">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g. shonen, limited edition"
                      className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                    />
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">Separate tags with commas</p>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">Get started by adding your first product.</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
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
                  {products.map((product) => (
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
                            <div className="font-medium text-gray-900 truncate">{product.name}</div>
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
                          {product.category}
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