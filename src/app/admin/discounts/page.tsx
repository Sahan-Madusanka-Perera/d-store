import DiscountManager from '@/components/admin/DiscountManager'

export const metadata = {
    title: 'Discount Management | Admin',
}

export default function AdminDiscountsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <DiscountManager />
        </div>
    )
}
