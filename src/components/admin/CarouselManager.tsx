'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Save, X, ImageIcon, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import type { CarouselSlide } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

const getAverageColor = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            if (!ctx) { resolve('#000000'); return; }
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let r = 0, g = 0, b = 0, count = 0;

            for (let i = 0; i < data.length; i += 4) {
                // Ignore transparent pixels (alpha < 128)
                if (data[i + 3] >= 128) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
            }
            if (count === 0) { resolve('#000000'); return; }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            resolve(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
        };
        img.onerror = () => resolve('#000000');
        img.src = URL.createObjectURL(file);
    });
};

export default function CarouselManager() {
    const [slides, setSlides] = useState<CarouselSlide[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [editForm, setEditForm] = useState<Partial<CarouselSlide>>({})
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const response = await fetch('/api/admin/carousel')
            if (!response.ok) throw new Error('Failed to fetch slides')
            const data = await response.json()
            setSlides(data)
        } catch (error) {
            toast.error('Error loading carousel slides')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (slide: CarouselSlide) => {
        setEditForm(slide)
        setIsEditing(slide.id)
        setIsAdding(false)
        setImageFile(null)
        setImagePreview(slide.image_url || null)
    }

    const handleAdd = () => {
        setEditForm({
            title: '',
            subtitle: '',
            cta_text: 'SHOP NOW',
            link_url: '/',
            bg_class: 'bg-black text-white',
            bg_color: '',
            image_alignment: 'right',
            is_active: true,
            image_url: null,
            sort_order: slides.length > 0 ? Math.max(...slides.map(s => s.sort_order)) + 1 : 1
        })
        setIsAdding(true)
        setIsEditing(null)
        setImageFile(null)
        setImagePreview(null)
    }

    const handleCancel = () => {
        setIsEditing(null)
        setIsAdding(false)
        setEditForm({})
        setImageFile(null)
        if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('Image must be less than 10MB')
            return
        }

        setImageFile(file)
        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)

        // Extract color and determine text color
        try {
            const color = await getAverageColor(file)
            // Calculate relative luminance to determine text color
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            const textColor = luminance > 0.5 ? 'text-black' : 'text-white';
            setEditForm(prev => ({
                ...prev,
                bg_color: color,
                bg_class: `bg-[${color}] ${textColor}`
            }));
            toast.success(`Color ${color} automatically extracted from image`);
        } catch (error) {
            console.error('Failed to extract color:', error);
        }
    }

    const uploadImage = async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
            .from('product-images') // Reusing the product-images bucket
            .upload(`carousel/${fileName}`, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('Image upload error:', error)
            throw new Error(`Image upload failed: ${error.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(`carousel/${fileName}`)

        return publicUrl
    }

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            let uploadedImageUrl = editForm.image_url

            if (imageFile) {
                uploadedImageUrl = await uploadImage(imageFile)
            }

            const payload = { ...editForm, image_url: uploadedImageUrl }

            const method = isAdding ? 'POST' : 'PUT'
            const url = isAdding ? '/api/admin/carousel' : `/api/admin/carousel/${editForm.id}`

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) throw new Error('Failed to save slide')

            toast.success(isAdding ? 'Slide added successfully' : 'Slide updated successfully')
            fetchSlides()
            handleCancel()
        } catch (error) {
            toast.error('Error saving slide')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this slide?')) return

        try {
            const response = await fetch(`/api/admin/carousel/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete slide')

            toast.success('Slide deleted successfully')
            fetchSlides()
        } catch (error) {
            toast.error('Error deleting slide')
            console.error(error)
        }
    }

    const handleToggleActive = async (slide: CarouselSlide) => {
        try {
            const response = await fetch(`/api/admin/carousel/${slide.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...slide, is_active: !slide.is_active }),
            })

            if (!response.ok) throw new Error('Failed to update slide')

            toast.success(`Slide ${slide.is_active ? 'deactivated' : 'activated'}`)
            fetchSlides()
        } catch (error) {
            toast.error('Error updating slide')
            console.error(error)
        }
    }

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === slides.length - 1)
        ) return

        const newIndex = direction === 'up' ? index - 1 : index + 1
        const currentSlide = slides[index]
        const swapSlide = slides[newIndex]

        // Optimistic update
        const newSlides = [...slides]
        newSlides[index] = { ...currentSlide, sort_order: swapSlide.sort_order }
        newSlides[newIndex] = { ...swapSlide, sort_order: currentSlide.sort_order }
        // Re-sort the array for the UI immediately
        newSlides.sort((a, b) => a.sort_order - b.sort_order)
        setSlides(newSlides)

        try {
            // Update both in parallel
            await Promise.all([
                fetch(`/api/admin/carousel/${currentSlide.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sort_order: swapSlide.sort_order }),
                }),
                fetch(`/api/admin/carousel/${swapSlide.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sort_order: currentSlide.sort_order }),
                })
            ])
        } catch (error) {
            toast.error('Error reordering slides')
            console.error(error)
            fetchSlides() // Revert on error
        }
    }


    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading carousel data...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Hero Carousel</h2>
                    <p className="text-gray-500">Manage the sliding banners on the home page.</p>
                </div>
                {!isAdding && !isEditing && (
                    <Button onClick={handleAdd} className="bg-brand-gradient text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Slide
                    </Button>
                )}
            </div>

            <Dialog open={isAdding || isEditing !== null} onOpenChange={(open) => {
                if (!open) handleCancel()
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden z-50 bg-white border border-gray-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-2xl">
                    <DialogHeader className="p-6 px-8 border-b border-gray-100 bg-gray-50/80 shrink-0">
                        <DialogTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-gray-900">
                            {isAdding ? 'Add New Slide' : 'Edit Slide'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium">
                            Configure the content and appearance of the hero slide.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col overflow-hidden">
                        <div className="p-6 px-8 overflow-y-auto flex-1 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-gray-900 font-bold mb-1.5 block">Main Title (Large Text)</Label>
                                    <Input
                                        id="title"
                                        value={editForm.title || ''}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        placeholder="e.g. LEVEL UP YOUR REALITY"
                                        className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subtitle" className="text-gray-900 font-bold mb-1.5 block">Subtitle</Label>
                                    <Input
                                        id="subtitle"
                                        value={editForm.subtitle || ''}
                                        onChange={e => setEditForm({ ...editForm, subtitle: e.target.value })}
                                        placeholder="e.g. Premium Anime Merchandise"
                                        className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cta_text" className="text-gray-900 font-bold mb-1.5 block">Button Text</Label>
                                    <Input
                                        id="cta_text"
                                        value={editForm.cta_text || ''}
                                        onChange={e => setEditForm({ ...editForm, cta_text: e.target.value })}
                                        placeholder="e.g. SHOP NOW"
                                        className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link_url" className="text-gray-900 font-bold mb-1.5 block">Button Link</Label>
                                    <Input
                                        id="link_url"
                                        value={editForm.link_url || ''}
                                        onChange={e => setEditForm({ ...editForm, link_url: e.target.value })}
                                        placeholder="e.g. /products"
                                        className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bg_color" className="text-gray-900 font-bold mb-1.5 block">Dynamic Background Color (Hex)</Label>
                                    <div className="flex gap-2">
                                        <div
                                            className="w-11 h-11 rounded-xl border border-gray-200 shrink-0"
                                            style={{ backgroundColor: editForm.bg_color || '#000000' }}
                                        />
                                        <Input
                                            id="bg_color"
                                            value={editForm.bg_color || ''}
                                            onChange={e => setEditForm({ ...editForm, bg_color: e.target.value })}
                                            placeholder="e.g. #E63946"
                                            className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11 uppercase"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5 font-medium">Auto-generated when image uploaded, or set manually.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-900 font-bold mb-1.5 block">Image Alignment</Label>
                                    <div className="flex gap-2 h-11">
                                        <Button
                                            type="button"
                                            variant={editForm.image_alignment === 'left' ? 'default' : 'outline'}
                                            onClick={() => setEditForm(prev => ({ ...prev, image_alignment: 'left' }))}
                                            className={`flex-1 rounded-xl ${editForm.image_alignment === 'left' ? 'bg-black text-white' : ''}`}
                                        >
                                            Left
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={editForm.image_alignment === 'right' ? 'default' : 'outline'}
                                            onClick={() => setEditForm(prev => ({ ...prev, image_alignment: 'right' }))}
                                            className={`flex-1 rounded-xl ${editForm.image_alignment === 'right' ? 'bg-black text-white' : ''}`}
                                        >
                                            Right
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="bg_class" className="text-gray-900 font-bold mb-1.5 block">Fallback CSS Classes (Tailwind)</Label>
                                    <Input
                                        id="bg_class"
                                        value={editForm.bg_class || ''}
                                        onChange={e => setEditForm({ ...editForm, bg_class: e.target.value })}
                                        placeholder="e.g. bg-black text-white"
                                        className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 rounded-xl h-11"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5 font-medium">Controls text color (e.g., text-white or text-black). Updated automatically based on background color.</p>
                                </div>

                                {/* Image Upload Area */}
                                <div className="space-y-4 md:col-span-2">
                                    <Label className="text-gray-900 font-bold mb-1.5 block">Slide Image (Optional) – Will be used for dynamic background blurring</Label>

                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:bg-white hover:border-black transition-all group relative overflow-hidden transition-colors">
                                        <div className="text-center relative z-10">
                                            <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-black transition-all duration-300 shadow-sm">
                                                <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-black transition-colors" />
                                            </div>
                                            <div>
                                                <Label htmlFor="image_url" className="cursor-pointer inline-flex flex-col items-center">
                                                    <span className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors">
                                                        Click to select image
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-2 block font-medium">
                                                        PNG, JPG, GIF up to 10MB.
                                                    </span>
                                                    <Input
                                                        id="image_url"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    {imagePreview && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500 mb-3 font-medium">Image Preview:</p>
                                            <div className="relative w-48 aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                <Image
                                                    src={imagePreview}
                                                    alt="Slide Preview"
                                                    fill
                                                    className="object-contain"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                    onClick={() => {
                                                        setImageFile(null)
                                                        if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview)
                                                        setImagePreview(null)
                                                        setEditForm({ ...editForm, image_url: null })
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 px-8 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3 shrink-0">
                            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting} className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl h-11 px-6">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSubmitting} className="bg-black hover:bg-gray-900 border-0 text-white transition-all duration-300 rounded-xl font-bold h-11 px-8 shadow-md">
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" /> Save Slide
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid gap-4">
                {slides.map((slide, index) => (
                    <Card key={slide.id} className={`overflow-hidden transition-all duration-200 ${!slide.is_active ? 'opacity-60 grayscale-[0.5]' : ''} hover:shadow-md border-l-4 ${slide.is_active ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                        <CardContent className="p-0 flex flex-col sm:flex-row items-center">

                            {/* Order Controls */}
                            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 border-r border-gray-100 sm:h-full">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 mb-1"
                                    onClick={() => handleMove(index, 'up')}
                                    disabled={index === 0 || isEditing !== null}
                                >
                                    <ArrowUp className="w-4 h-4 text-gray-500" />
                                </Button>
                                <span className="text-xs font-mono text-gray-400 font-bold">{slide.sort_order}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 mt-1"
                                    onClick={() => handleMove(index, 'down')}
                                    disabled={index === slides.length - 1 || isEditing !== null}
                                >
                                    <ArrowDown className="w-4 h-4 text-gray-500" />
                                </Button>
                            </div>

                            {/* Preview Thumbnail (CSS based) */}
                            <div
                                className={`w-full sm:w-48 h-32 sm:h-full flex items-center justify-center p-4 relative ${slide.bg_class?.includes('text-white') ? 'text-white' : 'text-black'}`}
                                style={{ backgroundColor: slide.bg_color || '#000' }}
                            >
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                                <div className="z-10 text-center scale-75 transform origin-center">
                                    <h3 className="font-black text-xl uppercase tracking-tighter leading-tight">{slide.title.substring(0, 15)}{slide.title.length > 15 ? '...' : ''}</h3>
                                </div>
                                {slide.image_url && (
                                    <div className={`absolute inset-0 opacity-20 bg-contain bg-no-repeat ${slide.image_alignment === 'left' ? 'bg-left' : 'bg-right'}`} style={{ backgroundImage: `url(${slide.image_url})` }} />
                                )}
                            </div>

                            {/* Data */}
                            <div className="flex-1 p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{slide.title}</h3>
                                    <Badge variant={slide.is_active ? "default" : "secondary"} className={slide.is_active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                                        {slide.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{slide.subtitle}</p>
                                <div className="flex gap-4 text-xs font-mono text-gray-500">
                                    <span className="flex items-center"><span className="bg-gray-200 px-2 py-1 rounded mr-1">BTN</span> {slide.cta_text} &rarr; {slide.link_url}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex sm:flex-col items-center justify-end gap-2 p-5 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50 sm:h-full">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => handleToggleActive(slide)}
                                    disabled={isEditing !== null}
                                >
                                    {slide.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleEdit(slide)}
                                    disabled={isEditing !== null}
                                >
                                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(slide.id)}
                                    disabled={isEditing !== null}
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {slides.length === 0 && !isLoading && (
                    <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No slides found</h3>
                        <p className="text-gray-500 mb-4">You haven't added any slides to the carousel yet.</p>
                        <Button onClick={handleAdd} className="bg-brand-gradient text-white">
                            Create First Slide
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
