'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Eye, PenTool, LayoutTemplate, Image as ImageIcon, Loader2, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { renderNewsletterHtml } from '@/lib/newsletter-template';

export default function CampaignBuilder({ products, subscribersCount }: { products: any[], subscribersCount: number }) {
    const [subject, setSubject] = useState('');
    const [heading, setHeading] = useState('Exclusive Drops Unlocked!');
    const [body, setBody] = useState('Thank you for being part of the D-Store community. We have some exciting new arrivals that we think you will love. Check them out below before they run out of stock!');

    // Allow up to 3 products
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

    const [view, setView] = useState<'edit' | 'preview'>('edit');
    const [isSending, setIsSending] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    const toggleProduct = (product: any) => {
        if (selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else if (selectedProducts.length < 3) {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const dispatch = async (testOnly: boolean) => {
        testOnly ? setIsTesting(true) : setIsSending(true);
        try {
            const res = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    heading,
                    body,
                    products: selectedProducts,
                    testOnly,
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send campaign');
            }

            toast.success(data.message);

            // A test leaves the draft intact so it can be sent for real next.
            if (!testOnly) {
                setSubject('');
                setSelectedProducts([]);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(testOnly ? `Test send failed: ${message}` : `Send failed: ${message}`);
            console.error(error);
        } finally {
            testOnly ? setIsTesting(false) : setIsSending(false);
        }
    };

    // Same renderer the send route uses, so the preview is the email.
    const previewHtml = useMemo(() => {
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return renderNewsletterHtml({
            heading,
            body,
            products: selectedProducts,
            siteUrl,
            unsubscribeUrl: `${siteUrl}/newsletter/unsubscribe?status=ok`,
        });
    }, [heading, body, selectedProducts]);

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

                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => dispatch(true)}
                            disabled={!subject || isTesting || isSending}
                            className="w-full h-12 font-semibold border-gray-300"
                        >
                            {isTesting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending test...</>
                            ) : (
                                <><FlaskConical className="w-4 h-4 mr-2" /> Send test to myself</>
                            )}
                        </Button>

                        {/* A campaign send is irreversible and hits every subscriber at once,
                            so it gets a confirmation step rather than a single click. */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    disabled={!subject || isSending || isTesting || subscribersCount === 0}
                                    className="w-full h-14 text-lg font-bold bg-gray-900 hover:bg-black shadow-lg"
                                >
                                    {isSending ? (
                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending campaign...</>
                                    ) : (
                                        <>Send to {subscribersCount} Subscriber{subscribersCount === 1 ? '' : 's'} <Send className="w-5 h-5 ml-2" /></>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Send to {subscribersCount} subscriber{subscribersCount === 1 ? '' : 's'}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                        <div className="space-y-3 text-gray-600">
                                            <p>This sends immediately and cannot be undone or recalled.</p>
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                                                <div className="font-semibold text-gray-900 break-words">{subject}</div>
                                                <div className="text-gray-500 mt-1">
                                                    {selectedProducts.length > 0
                                                        ? `${selectedProducts.length} featured product${selectedProducts.length === 1 ? '' : 's'}`
                                                        : 'No featured products'}
                                                </div>
                                            </div>
                                            <p className="text-sm">Sent a test to yourself and checked how it looks?</p>
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => dispatch(false)}
                                        className="bg-gray-900 hover:bg-black font-bold"
                                    >
                                        Send now
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
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

                    {/* The preview renders the exact template the send route uses, in an
                        iframe so the email's own styles stay sealed off from the admin page.
                        Previously this was a hand-written re-creation and had already drifted
                        from what actually shipped. */}
                    <iframe
                        title="Email preview"
                        srcDoc={previewHtml}
                        className="flex-1 w-full border-0 bg-neutral-900"
                        sandbox=""
                    />
                </div>
            </div>
        </div>
    );
}
