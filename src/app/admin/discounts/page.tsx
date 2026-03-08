import DiscountManager from '@/components/admin/DiscountManager'
import PublisherDiscountManager from '@/components/admin/PublisherDiscountManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tag, BookOpen } from 'lucide-react'

export const metadata = {
    title: 'Discount Management | Admin',
}

export default function AdminDiscountsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Discount Management</h1>
                    <p className="text-gray-500 mt-1">Configure global sale events and product markdowns.</p>
                </div>
            </div>

            <Tabs defaultValue="quantity" className="space-y-6">
                <TabsList className="bg-gray-100 p-1 border border-gray-200 w-full sm:w-auto flex flex-wrap sm:inline-flex">
                    <TabsTrigger value="quantity" className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex-1 sm:flex-none">
                        <Tag className="w-4 h-4 mr-2" /> Quantity Discounts
                    </TabsTrigger>
                    <TabsTrigger value="publisher" className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex-1 sm:flex-none">
                        <BookOpen className="w-4 h-4 mr-2" /> Publisher Discounts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="quantity" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DiscountManager />
                </TabsContent>

                <TabsContent value="publisher" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PublisherDiscountManager />
                </TabsContent>
            </Tabs>
        </div>
    )
}
