'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { PublisherDiscount } from '@/types/database'

export default function PublisherDiscountManager() {
    const [discounts, setDiscounts] = useState<PublisherDiscount[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [editForm, setEditForm] = useState<Partial<PublisherDiscount>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchDiscounts()
    }, [])

    const fetchDiscounts = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/discounts/publisher')
            if (!response.ok) throw new Error('Failed to fetch discounts')
            const data = await response.json()
            setDiscounts(data)
        } catch (error) {
            toast.error('Error loading publisher discounts')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (discount: PublisherDiscount) => {
        setEditForm(discount)
        setIsEditing(discount.id)
        setIsAdding(false)
    }

    const handleAdd = () => {
        setEditForm({
            publisher: '',
            discount_percentage: 10,
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
        if (!editForm.publisher || !editForm.discount_percentage) {
            toast.error("Publisher and Discount Percentage are required.")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                ...editForm,
                discount_percentage: Number(editForm.discount_percentage),
            }

            const method = isAdding ? 'POST' : 'PUT'
            const url = isAdding ? '/api/admin/discounts/publisher' : `/api/admin/discounts/publisher/${editForm.id}`

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) throw new Error('Failed to save publisher discount')

            toast.success(isAdding ? 'Publisher discount added successfully' : 'Publisher discount updated successfully')
            fetchDiscounts()
            handleCancel()
        } catch (error) {
            toast.error('Error saving publisher discount')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this publisher discount?')) return

        try {
            const response = await fetch(`/api/admin/discounts/publisher/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete publisher discount')

            toast.success('Publisher discount deleted successfully')
            fetchDiscounts()
        } catch (error) {
            toast.error('Error deleting publisher discount')
            console.error(error)
        }
    }

    const handleToggleActive = async (discount: PublisherDiscount) => {
        try {
            const response = await fetch(`/api/admin/discounts/publisher/${discount.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...discount, is_active: !discount.is_active }),
            })

            if (!response.ok) throw new Error('Failed to update publisher discount')

            toast.success(`Publisher discount ${discount.is_active ? 'deactivated' : 'activated'}`)
            fetchDiscounts()
        } catch (error) {
            toast.error('Error updating publisher discount')
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Publisher Discounts</h2>
                    <p className="text-gray-500">Manage site-wide discounts for specific manga publishers.</p>
                </div>
                {!isAdding && !isEditing && (
                    <Button onClick={handleAdd} className="bg-brand-gradient text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Publisher Discount
                    </Button>
                )}
            </div>

            <Dialog open={isAdding || isEditing !== null} onOpenChange={(open) => {
                if (!open) handleCancel()
            }}>
                <DialogContent className="max-w-2xl bg-white border border-gray-200 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {isAdding ? 'Add New Publisher Discount' : 'Edit Publisher Discount'}
                        </DialogTitle>
                        <DialogDescription>
                            Apply an automatic discount to all manga from a specific publisher.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="publisher" className="font-bold">Publisher Name</Label>
                            <Input
                                id="publisher"
                                value={editForm.publisher || ''}
                                onChange={e => setEditForm({ ...editForm, publisher: e.target.value })}
                                placeholder="e.g. Viz Media"
                                className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl h-11"
                            />
                            <p className="text-xs text-gray-500">Must exactly match the publisher text on products.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discount_percentage" className="font-bold">Percentage Off (%)</Label>
                            <Input
                                id="discount_percentage"
                                type="number"
                                min="1"
                                max="100"
                                value={editForm.discount_percentage || ''}
                                onChange={e => setEditForm({ ...editForm, discount_percentage: parseFloat(e.target.value) })}
                                placeholder="e.g. 15"
                                className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl h-11"
                            />
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
                    Loading publisher discounts...
                </div>
            ) : discounts.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No publisher discounts found</h3>
                    <p className="text-gray-500 mb-4">Create site-wide discounts for specific publishers (e.g. 10% off Viz Media manga).</p>
                    <Button onClick={handleAdd} className="bg-brand-gradient text-white">
                        Create First Rule
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {discounts.map((discount) => (
                        <Card key={discount.id} className={`overflow-hidden transition-all duration-200 ${!discount.is_active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                            <CardContent className="p-0 flex flex-col sm:flex-row items-stretch">
                                <div className={`w-2 shrink-0 ${discount.is_active ? 'bg-purple-500' : 'bg-gray-300'}`} />
                                <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {discount.publisher}
                                        </h3>
                                        <Badge variant={discount.is_active ? "default" : "secondary"} className={discount.is_active ? "bg-green-100 text-green-800" : ""}>
                                            {discount.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="font-bold text-2xl text-purple-600 tracking-tight">
                                        {discount.discount_percentage}% OFF
                                    </p>
                                </div>
                                <div className="flex sm:flex-col items-center justify-center gap-2 p-5 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50">
                                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleToggleActive(discount)}>
                                        {discount.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start text-blue-600" onClick={() => handleEdit(discount)}>
                                        <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start text-red-600" onClick={() => handleDelete(discount.id)}>
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
