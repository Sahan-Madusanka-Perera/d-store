import DiscountManager from '@/components/admin/DiscountManager'

export const metadata = {
    title: 'Discount Management | Admin',
}

/**
 * Quantity discounts are the only rule set left here — publisher discounts were
 * removed, so the tab strip that used to switch between the two went with them.
 * Per-product discount eligibility lives on the product itself, under
 * Products → edit → Discount Eligible.
 */
export default function AdminDiscountsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Discount Management</h1>
                    <p className="text-gray-500 mt-1">Configure global sale events and product markdowns.</p>
                </div>
            </div>

            <DiscountManager />
        </div>
    )
}
