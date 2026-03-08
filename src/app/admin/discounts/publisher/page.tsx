import PublisherDiscountManager from '@/components/admin/PublisherDiscountManager'

export const metadata = {
    title: 'Publisher Discounts | Admin',
}

export default function PublisherDiscountsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PublisherDiscountManager />
        </div>
    )
}
