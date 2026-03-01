import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Eye, PenTool, LayoutTemplate, X, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CampaignBuilder({ products, subscribersCount }: { products: any[], subscribersCount: number }) {
    const [subject, setSubject] = useState('');
    const [heading, setHeading] = useState('Exclusive Drops Unlocked!');
    const [body, setBody] = useState('Thank you for being part of the D-Store community. We have some exciting new arrivals that we think you will love. Check them out below before they run out of stock!');

    // Allow up to 3 products
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

    const [view, setView] = useState<'edit' | 'preview'>('edit');
    const [isSending, setIsSending] = useState(false);

    const toggleProduct = (product: any) => {
        if (selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else if (selectedProducts.length < 3) {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            const res = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    heading,
                    body,
                    products: selectedProducts
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send campaign');
            }

            alert(data.message + '\\n(Note: This is currently logging the HTML to your terminal console instead of sending real emails until Resend is configured)');
            setSubject('');
            setSelectedProducts([]);
            // Optional: You could trigger a router.refresh() here or use a callback to refresh history if we were on the history tab
        } catch (error: any) {
            alert('Error: ' + error.message);
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side: Editor */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-gray-500" />
                        Campaign Editor
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            variant={view === 'edit' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('edit')}
                            className="lg:hidden"
                        >
                            Edit
                        </Button>
                        <Button
                            variant={view === 'preview' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('preview')}
                            className="lg:hidden"
                        >
                            <Eye className="w-4 h-4 mr-1" /> Preview
                        </Button>
                    </div>
                </div>

                <div className={`space-y-6 ${view === 'preview' ? 'hidden lg:block' : 'block'}`}>
                    <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject Line</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. 🔥 New Anime Figures Arrived!"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
                                <input
                                    type="text"
                                    value={heading}
                                    onChange={(e) => setHeading(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Selector */}
                    <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-medium text-gray-900">Feature Products</h3>
                                    <p className="text-sm text-gray-500">Select up to 3 products to highlight</p>
                                </div>
                                <Badge variant="secondary" className="font-mono">{selectedProducts.length}/3</Badge>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                                {products.map((product) => {
                                    const isSelected = selectedProducts.find(p => p.id === product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => toggleProduct(product)}
                                            className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-300'}`}
                                        >
                                            <div className="aspect-square bg-gray-50 relative">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300"><ImageIcon className="w-8 h-8" /></div>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                                                        <span className="text-xs font-bold">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-2 bg-white">
                                                <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleSend}
                        disabled={!subject || isSending || subscribersCount === 0}
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/20"
                    >
                        {isSending ? 'Sending Campaign...' : `Send to ${subscribersCount} Subscribers`}
                        <Send className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Right Side: Live Preview */}
            <div className={`space-y-6 ${view === 'edit' ? 'hidden lg:block' : 'block'}`}>
                <div className="flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5 text-gray-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
                </div>

                {/* Email Mock Window */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden flex flex-col h-[800px]">
                    {/* Fake Email Header */}
                    <div className="bg-gray-50 border-b border-gray-200 p-4 space-y-2">
                        <div className="flex items-center text-sm">
                            <span className="text-gray-500 w-16">To:</span>
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-mono">Anime Fan {"<subscriber@example.com>"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-gray-500 w-16">From:</span>
                            <span className="font-medium">D-Store Updates</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-gray-500 w-16">Subject:</span>
                            <span className="font-semibold text-gray-900">{subject || 'No subject'}</span>
                        </div>
                    </div>

                    {/* Email Content Preview (The exact HTML structure we will send) */}
                    <div className="bg-neutral-900 flex-1 overflow-y-auto p-4 sm:p-8">
                        {/* Premium Email Template Re-creation */}
                        <div className="max-w-[600px] mx-auto bg-black text-white rounded-3xl overflow-hidden border border-gray-800 font-sans">
                            {/* Header Image/Logo Area */}
                            <div className="bg-gradient-to-b from-gray-900 to-black p-8 text-center border-b border-gray-800">
                                <h1 className="text-3xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                    D-STORE
                                </h1>
                                <p className="text-gray-400 text-sm mt-2 tracking-widest uppercase">Premium Otaku Lifestyle</p>
                            </div>

                            {/* Body Area */}
                            <div className="p-8 space-y-6">
                                <h2 className="text-2xl font-bold leading-tight">{heading}</h2>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{body}</p>

                                {/* Featured Products */}
                                {selectedProducts.length > 0 && (
                                    <div className="pt-6 mt-6 border-t border-gray-800">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Featured Gear</h3>

                                        <div className="space-y-6">
                                            {selectedProducts.map((p) => (
                                                <div key={p.id} className="flex gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                                    <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon className="w-6 h-6" /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col justify-center flex-1">
                                                        <h4 className="font-semibold text-lg line-clamp-2">{p.name}</h4>
                                                        <p className="text-purple-400 font-bold mt-1">{formatPrice(p.price)}</p>
                                                        <a href="#" className="mt-2 text-sm text-gray-400 hover:text-white underline">View Details →</a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Call to Action */}
                                <div className="pt-8 text-center">
                                    <a href="#" className="inline-block bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-gray-200 transition-colors">
                                        Shop All New Arrivals
                                    </a>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 text-center bg-gray-900/50 border-t border-gray-800">
                                <p className="text-gray-500 text-xs">
                                    You are receiving this email because you subscribed to updates from D-Store.<br />
                                    <a href="#" className="underline hover:text-white">Unsubscribe</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
