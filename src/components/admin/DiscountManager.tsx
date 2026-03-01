'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Save, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { QuantityDiscount } from '@/types/database'

export default function DiscountManager() {
    const [discounts, setDiscounts] = useState<QuantityDiscount[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [editForm, setEditForm] = useState<Partial<QuantityDiscount>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchDiscounts()
    }, [])

    const fetchDiscounts = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/discounts')
            if (!response.ok) throw new Error('Failed to fetch discounts')
            const data = await response.json()
            setDiscounts(data)
        } catch (error) {
            toast.error('Error loading discounts')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (discount: QuantityDiscount) => {
        setEditForm(discount)
        setIsEditing(discount.id)
        setIsAdding(false)
    }

    const handleAdd = () => {
        setEditForm({
            category: 'manga',
            min_quantity: 3,
            discount_percentage: 10,
            discount_fixed: 0,
            is_active: true,
        })
        setIsAdding(true)
        setIsEditing(null)
    }

    const handleCancel = () => {
        setIsEditing(null)
        setIsAdding(false)
        setEditForm({})
    }

    const handleSave = async () => {
        if (!editForm.category || !editForm.min_quantity) {
            toast.error("Category and Minimum Quantity are required.")
            return
        }

        setIsSubmitting(true)
        try {
            // Clean up numbers
            const payload = {
                ...editForm,
                min_quantity: Number(editForm.min_quantity),
                discount_percentage: editForm.discount_percentage ? Number(editForm.discount_percentage) : null,
                discount_fixed: editForm.discount_fixed ? Number(editForm.discount_fixed) : null,
            }

            const method = isAdding ? 'POST' : 'PUT'
            const url = isAdding ? '/api/admin/discounts' : `/api/admin/discounts/${editForm.id}`

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) throw new Error('Failed to save discount')

            toast.success(isAdding ? 'Discount added successfully' : 'Discount updated successfully')
            fetchDiscounts()
            handleCancel()
        } catch (error) {
            toast.error('Error saving discount')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this discount rule?')) return

        try {
            const response = await fetch(`/api/admin/discounts/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete discount')

            toast.success('Discount deleted successfully')
            fetchDiscounts()
        } catch (error) {
            toast.error('Error deleting discount')
            console.error(error)
        }
    }

    const handleToggleActive = async (discount: QuantityDiscount) => {
        try {
            const response = await fetch(`/api/admin/discounts/${discount.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...discount, is_active: !discount.is_active }),
            })

            if (!response.ok) throw new Error('Failed to update discount')

            toast.success(`Discount ${discount.is_active ? 'deactivated' : 'activated'}`)
            fetchDiscounts()
        } catch (error) {
            toast.error('Error updating discount')
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quantity Discounts</h2>
                    <p className="text-gray-500">Manage flexible auto-discounts based on cart quantities.</p>
                </div>
                {!isAdding && !isEditing && (
                    <Button onClick={handleAdd} className="bg-brand-gradient text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Discount Rule
                    </Button>
                )}
            </div>

            <Dialog open={isAdding || isEditing !== null} onOpenChange={(open) => {
                if (!open) handleCancel()
            }}>
                <DialogContent className="max-w-2xl bg-white border border-gray-200 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {isAdding ? 'Add New Discount Rule' : 'Edit Discount Rule'}
                        </DialogTitle>
                        <DialogDescription>
                            Define conditions and values for automatic cart discounts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="category" className="font-bold">Applies to Category</Label>
                            <select
                                id="category"
                                value={editForm.category || 'manga'}
                                onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}
                                className="w-full h-11 bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black text-black rounded-xl px-3"
                            >
                                <option value="manga">Manga</option>
                                <option value="figures">Figures</option>
                                <option value="tshirts">T-Shirts</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="min_quantity" className="font-bold">Minimum Quantity Needed</Label>
                            <Input
                                id="min_quantity"
                                type="number"
                                min="1"
                                value={editForm.min_quantity || ''}
                                onChange={e => setEditForm({ ...editForm, min_quantity: parseInt(e.target.value) })}
                                placeholder="e.g. 3"
                                className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl h-11"
                            />
                            <p className="text-xs text-gray-500">How many items of this category must be in the cart to trigger the discount? (e.g. 3)</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="discount_percentage" className="font-bold">Percentage Off (%)</Label>
                                <Input
                                    id="discount_percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editForm.discount_percentage || ''}
                                    onChange={e => setEditForm({ ...editForm, discount_percentage: parseFloat(e.target.value), discount_fixed: 0 })}
                                    placeholder="e.g. 10"
                                    className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount_fixed" className="font-bold">Fixed Amount Off (LKR)</Label>
                                <Input
                                    id="discount_fixed"
                                    type="number"
                                    min="0"
                                    value={editForm.discount_fixed || ''}
                                    onChange={e => setEditForm({ ...editForm, discount_fixed: parseFloat(e.target.value), discount_percentage: 0 })}
                                    placeholder="e.g. 500"
                                    className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl h-11"
                                />
                            </div>
                            <p className="text-xs text-gray-500 col-span-2">Note: Fill out either Percentage OR Fixed amount. If both are filled, Percentage might take precedence depending on logic.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button variant="outline" onClick={handleCancel} disabled={isSubmitting} className="rounded-xl h-11">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSubmitting} className="bg-black hover:bg-gray-900 border-0 text-white rounded-xl font-bold h-11 px-8">
                            {isSubmitting ? 'Saving...' : 'Save Rule'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {isLoading ? (
                <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4 text-gray-400" />
                    Loading discount rules...
                </div>
            ) : discounts.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No discount rules found</h3>
                    <p className="text-gray-500 mb-4">Create auto-discounts (like "Buy 3 Manga, get 10% off") to boost sales.</p>
                    <Button onClick={handleAdd} className="bg-brand-gradient text-white">
                        Create First Rule
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {discounts.map((discount) => (
                        <Card key={discount.id} className={`overflow-hidden transition-all duration-200 ${!discount.is_active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                            <CardContent className="p-0 flex flex-col sm:flex-row items-stretch">

                                {/* Status Color Bar */}
                                <div className={`w-2 shrink-0 ${discount.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />

                                {/* Data Area */}
                                <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            Buy <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{discount.min_quantity}+</span> <span className="capitalize">{discount.category}</span>
                                        </h3>
                                        <Badge variant={discount.is_active ? "default" : "secondary"} className={discount.is_active ? "bg-green-100 text-green-800" : ""}>
                                            {discount.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="font-bold text-2xl text-green-600 tracking-tight">
                                        Get {discount.discount_percentage ? `${discount.discount_percentage}% OFF` : `LKR ${discount.discount_fixed} OFF`}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex sm:flex-col items-center justify-center gap-2 p-5 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => handleToggleActive(discount)}
                                    >
                                        {discount.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-blue-600"
                                        onClick={() => handleEdit(discount)}
                                    >
                                        <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-red-600"
                                        onClick={() => handleDelete(discount.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
