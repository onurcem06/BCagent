"use client";

import { useBrandStore } from '../lib/store';
import { Palette, Target, Fingerprint, Type, Mic, Share2, Monitor, Trophy, Globe } from 'lucide-react';
import { useEffect } from 'react';

// Modern, high-end Swiss Style Brand Guidelines
export default function BrandGuidePDF() {
    const { identity } = useBrandStore();

    // Ensure fonts are loaded because PDF generation essentially screenshots the DOM
    useEffect(() => {
        const loadFont = (fontName: string) => {
            if (!fontName) return;
            const link = document.createElement('link');
            // Clean font name for Google Fonts API (e.g., "Plus Jakarta Sans" -> "Plus+Jakarta+Sans")
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        };

        loadFont(identity.typography.heading_font);
        loadFont(identity.typography.body_font);
    }, [identity]);

    if (!identity.brand_dna.purpose) return null;

    return (
        <div id="brand-guide-content" className="w-full max-w-[1200px] mx-auto bg-white text-black font-sans leading-relaxed selection:bg-black selection:text-white print:max-w-none">

            {/* 1. COVER PAGE -- IMPACTFUL & BOLD */}
            {/* Using inline styles for dynamic colors to ensure print fidelity */}
            <div className="min-h-[1100px] bg-black text-white relative flex flex-col justify-between p-12 md:p-24 overflow-hidden print:min-h-[100vh] print:break-after-always">

                {/* Background Element */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                {identity.color_palette.primary && (
                    <div className="absolute bottom-0 left-0 w-full h-[400px] opacity-20 blur-3xl pointer-events-none" style={{ background: `linear-gradient(to top, ${identity.color_palette.primary}, transparent)` }}></div>
                )}

                {/* Hero Image Overlay or Dynamic Abstract Pattern */}
                {identity.visuals?.hero_url ? (
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                        <img src={identity.visuals.hero_url} className="w-full h-full object-cover grayscale contrast-125" alt="Brand Mood" />
                    </div>
                ) : (
                    <div className="absolute inset-0 opacity-30 mix-blend-overlay"
                        style={{
                            backgroundImage: `
                                radial-gradient(circle at 20% 30%, ${identity.color_palette.secondary || '#333'} 0%, transparent 20%),
                                radial-gradient(circle at 80% 70%, ${identity.color_palette.accent || '#666'} 0%, transparent 20%),
                                linear-gradient(45deg, ${identity.color_palette.primary || '#000'} 0%, transparent 100%)
                            `,
                            filter: 'blur(60px)'
                        }}
                    ></div>
                )}

                <div className="z-10 mt-12 w-full flex justify-between items-start">
                    <div className="flex flex-col gap-6">
                        {identity.visuals?.logo_url && (
                            <img src={identity.visuals.logo_url} className="w-48 h-48 object-contain bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10" alt="Logo" />
                        )}
                        <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-none" style={{ fontFamily: identity.typography.heading_font }}>
                            {identity.brand_name || identity.slogan_tone.tagline?.split(',')[0].substring(0, 15) || "BRAND"}
                        </h1>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-mono opacity-50">EST. {new Date().getFullYear()}</p>
                        <p className="text-sm font-mono opacity-50">GUIDELINES V1.0</p>
                    </div>
                </div>

                <div className="z-10 mb-12 border-t border-white/30 pt-8 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="max-w-xl">
                        <p className="text-2xl font-light tracking-wide leading-relaxed opacity-90">
                            {identity.brand_dna.purpose}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="w-4 h-4 rounded-full bg-white animate-pulse"></div>
                        <span className="font-mono text-xs uppercase tracking-widest">{identity.brand_dna.values?.[0]} — {identity.target_audience.archetype}</span>
                    </div>
                </div>
            </div>

            {/* 2. BRAND STRATEGY / GRID LAYOUT */}
            <div className="p-12 md:p-24 print:break-after-always print:min-h-[100vh]">
                <div className="mb-16 pb-6 border-b border-black flex justify-between items-end">
                    <h2 className="text-6xl font-bold tracking-tighter">01/ DNA</h2>
                    <span className="font-mono text-sm hidden md:block">STRATEGIC FOUNDATION</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]">
                    {/* Mission Card */}
                    <div className="bg-gray-50 p-10 col-span-1 lg:col-span-2 flex flex-col justify-between rounded-none border-l-4 border-black">
                        <Globe className="w-12 h-12 mb-6 opacity-20" />
                        <div>
                            <h3 className="font-mono text-sm uppercase tracking-widest mb-4 text-gray-400">Mission Statement</h3>
                            <p className="text-3xl md:text-4xl font-medium leading-tight">
                                {identity.brand_dna.purpose}
                            </p>
                        </div>
                    </div>

                    {/* Values Stack */}
                    <div className="flex flex-col gap-4">
                        <div className="flex-1 bg-black text-white p-8 flex flex-col justify-center">
                            <h3 className="font-mono text-xs text-gray-500 mb-2">ARCHETYPE</h3>
                            <p className="text-3xl font-bold">{identity.target_audience.archetype}</p>
                        </div>
                        <div className="flex-1 bg-gray-100 p-8 flex flex-col justify-center">
                            <h3 className="font-mono text-xs text-gray-500 mb-2">MARKET POSITION</h3>
                            <p className="text-xl font-medium">{identity.competitor_analysis.market_gap}</p>
                        </div>
                    </div>

                    {/* USP Big Text */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white border border-gray-200 p-12 text-center">
                        <h3 className="font-mono text-xs text-gray-400 mb-6 uppercase">Unique Selling Proposition</h3>
                        <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-600 leading-tight">
                            "{identity.brand_dna.usp}"
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. VISUAL IDENTITY SYSTEM */}
            <div className="bg-zinc-900 text-white p-12 md:p-24 print:break-after-always print:min-h-[100vh]">
                <div className="mb-16 pb-6 border-b border-white/20 flex justify-between items-end">
                    <h2 className="text-6xl font-bold tracking-tighter">02/ VISUALS</h2>
                    <span className="font-mono text-sm hidden md:block">COLOR & TYPE</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* A. COLOR PALETTE */}
                    <div className="space-y-8">
                        <h3 className="font-mono text-lg text-gray-400 border-l-2 border-white pl-4">CHROMATIC SYSTEM</h3>

                        {/* Huge Primary Swatch */}
                        <div className="w-full aspect-square relative group">
                            <div className="absolute inset-0 transition-transform group-hover:scale-[0.98] duration-500" style={{ backgroundColor: identity.color_palette.primary }}></div>
                            <div className="absolute bottom-6 left-6 bg-white text-black px-4 py-2 font-mono text-sm font-bold shadow-2xl">
                                PRIMARY — {identity.color_palette.primary}
                            </div>
                        </div>

                        {/* Secondary & Accent Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-[4/3] relative" style={{ backgroundColor: identity.color_palette.secondary }}>
                                <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-md px-3 py-1 font-mono text-xs text-white">
                                    {identity.color_palette.secondary}
                                </div>
                            </div>
                            <div className="aspect-[4/3] relative" style={{ backgroundColor: identity.color_palette.accent }}>
                                <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-md px-3 py-1 font-mono text-xs text-white">
                                    {identity.color_palette.accent}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed font-mono">
                            {identity.color_palette.rationale}
                        </p>
                    </div>

                    {/* B. TYPOGRAPHY */}
                    <div className="space-y-12">
                        <h3 className="font-mono text-lg text-gray-400 border-l-2 border-white pl-4">TYPOGRAPHY</h3>

                        {/* Heading Font Display */}
                        <div>
                            <span className="block text-xs font-mono text-gray-500 mb-2">HEADLINES — {identity.typography.heading_font}</span>
                            <div className="text-7xl md:text-8xl break-all leading-[0.8]" style={{ fontFamily: identity.typography.heading_font }}>
                                AaBb<br />CcDd
                            </div>
                        </div>

                        <div className="h-px bg-white/20 w-full"></div>

                        {/* Body Font Display */}
                        <div>
                            <span className="block text-xs font-mono text-gray-500 mb-2">BODY COPY — {identity.typography.body_font}</span>
                            <div className="text-xl md:text-2xl opacity-80 leading-relaxed" style={{ fontFamily: identity.typography.body_font }}>
                                "Design is not just what it looks like and feels like. Design is how it works."
                                <br />
                                <span className="opacity-50 text-base mt-2 block">
                                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                                    abcdefghijklmnopqrstuvwxyz<br />
                                    1234567890 !@#$%^&*()
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. COMMUNICATION & TONE */}
            <div className="p-12 md:p-24 print:min-h-[100vh]">
                <div className="mb-16 pb-6 border-b border-black flex justify-between items-end">
                    <h2 className="text-6xl font-bold tracking-tighter">03/ VOICE</h2>
                    <span className="font-mono text-sm hidden md:block">VERBAL IDENTITY</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div className="bg-black text-white p-12 flex flex-col items-center justify-center text-center aspect-[4/3] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50"></div>
                        <Mic className="w-12 h-12 mb-6 opacity-30 group-hover:scale-110 transition-transform duration-500" />
                        <h3 className="text-3xl font-bold relative z-10 leading-snug">
                            "{identity.slogan_tone.tagline}"
                        </h3>
                        <p className="mt-4 font-mono text-xs text-gray-400 relative z-10 uppercase">Official Tagline</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-black rounded-full"></span>
                                Tone of Voice
                            </h3>
                            <p className="text-xl leading-relaxed text-gray-700">
                                {identity.slogan_tone.tone_of_voice}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-8 border-l-2 border-black">
                            <h3 className="font-mono text-xs text-gray-400 mb-2 uppercase">Core Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {identity.brand_dna.values?.map((val, i) => (
                                    <span key={i} className="px-4 py-2 bg-white border border-gray-200 font-bold text-sm shadow-sm">
                                        {val}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-8 border-t border-gray-100 flex justify-between text-xs font-mono text-gray-400">
                    <p className="text-orange-600 font-bold">GENERATED BY K40T DIGITAL</p>
                    <p>{new Date().toLocaleDateString()}</p>
                </div>
            </div>

        </div>
    );
}
