'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to subscribe');
            }

            setStatus('success');
            setMessage(data.message);
            setEmail('');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    return (
        <section className="relative isolate overflow-hidden bg-zinc-950 border border-white/10 py-12 sm:py-16 px-6 sm:px-10 md:px-16 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-2xl transition-all w-full">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950/0 to-zinc-950/0 pointer-events-none"></div>

            <div className="flex flex-col xl:flex-row items-center justify-between gap-10 xl:gap-20 relative z-10">
                <div className="w-full max-w-2xl space-y-5 text-center xl:text-left">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] uppercase tracking-tighter">
                        Stay Up To Date <br className="hidden sm:block" />
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Our Latest Offers</span>
                    </h2>
                    <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-lg mx-auto xl:mx-0 font-medium">
                        Join our exclusive newsletter and never miss a drop. Be the first to access limited collections.
                    </p>
                </div>

                <div className="w-full max-w-lg space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 pointer-events-none transition-colors group-focus-within:text-white" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                disabled={status === 'loading' || status === 'success'}
                                required
                                className="w-full h-14 pl-14 pr-6 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50 text-base"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="w-full h-14 rounded-full bg-white text-black font-bold text-[15px] tracking-wide hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:hover:scale-100 disabled:opacity-80 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> SUBSCRIBING...</>
                            ) : status === 'success' ? (
                                <><CheckCircle2 className="w-5 h-5 text-green-600" /> SUBSCRIBED</>
                            ) : (
                                "SUBSCRIBE TO NEWSLETTER"
                            )}
                        </Button>
                    </form>

                    {message && (
                        <div className={`flex items-center space-x-2 text-sm px-4 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 ${status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {status === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            <span className="font-medium">{message}</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
