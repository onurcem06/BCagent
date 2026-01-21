"use client";

import { useBrandStore } from '../lib/store';
import { Palette, Target, Fingerprint, Type, Mic, Share2, Monitor, Trophy } from 'lucide-react';

export default function BrandGuidePDF() {
    const { identity } = useBrandStore();

    if (!identity.brand_dna.purpose) return null;

    return (
        <div className="bg-white text-slate-900 p-8 md:p-12 max-w-4xl mx-auto shadow-2xl print:shadow-none print:p-0 my-0 print:my-0 rounded-xl overflow-hidden print:rounded-none" id="brand-guide-content">
            {/* Header / Cover */}
            <div
                className="h-[600px] flex flex-col items-center justify-center text-white mb-12 rounded-lg relative overflow-hidden print:h-[1000px] print:rounded-none"
                style={{ backgroundColor: identity.color_palette.primary || '#000' }}
            >
                {identity.visuals?.hero_url && (
                    <img src={identity.visuals.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Hero Background" />
                )}
                {identity.visuals?.logo_url && (
                    <img src={identity.visuals.logo_url} className="w-32 h-32 object-contain mb-6 z-10 drop-shadow-2xl bg-white/10 rounded-xl p-2" alt="Brand Logo" />
                )}
                <h1 className="text-6xl font-black mb-4 z-10 drop-shadow-2xl text-center px-4" style={{ fontFamily: identity.typography.heading_font }}>
                    {identity.slogan_tone.tagline?.split(',')[0].trim() || "Brand Identity"}
                </h1>
                <div className="h-1.5 w-32 bg-white mb-6 z-10 rounded-full"></div>
                <p className="text-xl font-bold uppercase tracking-[0.2em] opacity-90 z-10 drop-shadow-lg">{identity.brand_dna.values?.[0] || "Strategic Brand Guidelines"}</p>
            </div>

            <div className="space-y-12">
                {/* Section: Brand DNA */}
                <section>
                    <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 mb-6">
                        <Fingerprint className="w-6 h-6 text-slate-400" />
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-800">01. Brand DNA</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-slate-500 uppercase text-xs mb-2">Purpose</h3>
                            <p className="text-lg leading-relaxed">{identity.brand_dna.purpose}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-500 uppercase text-xs mb-2">Core Values</h3>
                            <div className="flex flex-wrap gap-2">
                                {identity.brand_dna.values?.map((v, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium">{v}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-6 bg-slate-50 rounded-xl border-l-4 border-slate-300">
                        <h3 className="font-bold text-slate-500 uppercase text-xs mb-2">Unique Selling Proposition (USP)</h3>
                        <p className="text-xl font-serif italic text-slate-700">"{identity.brand_dna.usp}"</p>
                    </div>
                </section>

                {/* Section: Target Audience */}
                <section>
                    <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 mb-6">
                        <Target className="w-6 h-6 text-slate-400" />
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-800">02. Target Audience</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <h3 className="font-bold text-slate-500 uppercase text-xs mb-2">Archetype</h3>
                            <p className="text-lg font-bold text-slate-800">{identity.target_audience.archetype}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <h3 className="font-bold text-slate-500 uppercase text-xs mb-2">Demographics</h3>
                            <p className="text-slate-700">{identity.target_audience.demographics}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <h3 className="font-bold text-slate-500 uppercase text-xs mb-2">Psychographics</h3>
                            <p className="text-slate-700">{identity.target_audience.psychographics}</p>
                        </div>
                    </div>
                </section>

                {/* Section: Visual Language */}
                <section>
                    <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 mb-6">
                        <Palette className="w-6 h-6 text-slate-400" />
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-800">03. Visual Language</h2>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-500 uppercase text-xs mb-4">Color Palette</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="h-24 rounded-lg shadow-inner" style={{ backgroundColor: identity.color_palette.primary }}></div>
                                    <div className="text-center">
                                        <p className="font-bold text-xs uppercase">Primary</p>
                                        <p className="text-sm font-mono">{identity.color_palette.primary}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-24 rounded-lg shadow-inner border border-slate-100" style={{ backgroundColor: identity.color_palette.secondary }}></div>
                                    <div className="text-center">
                                        <p className="font-bold text-xs uppercase">Secondary</p>
                                        <p className="text-sm font-mono">{identity.color_palette.secondary}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-24 rounded-lg shadow-inner" style={{ backgroundColor: identity.color_palette.accent }}></div>
                                    <div className="text-center">
                                        <p className="font-bold text-xs uppercase">Accent</p>
                                        <p className="text-sm font-mono">{identity.color_palette.accent}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-slate-500 italic">{identity.color_palette.rationale}</p>
                        </div>

                        <div className="h-px bg-slate-100"></div>

                        <div>
                            <h3 className="font-bold text-slate-500 uppercase text-xs mb-4">Typography</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-slate-50 rounded-xl">
                                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tighter">Heading — {identity.typography.heading_font}</p>
                                    <h4 className="text-4xl" style={{ fontFamily: identity.typography.heading_font }}>The Quick Brown Fox</h4>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-xl">
                                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tighter">Body — {identity.typography.body_font}</p>
                                    <p className="text-lg leading-relaxed" style={{ fontFamily: identity.typography.body_font }}>
                                        The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Digital & Content Strategy */}
                <section className="page-break-before: always">
                    <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 mb-6">
                        <Share2 className="w-6 h-6 text-slate-400" />
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-800">04. Content & Digital</h2>
                    </div>

                    {identity.visuals?.social_url && (
                        <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                            <img src={identity.visuals.social_url} className="w-full h-auto" alt="Brand Social Visual" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-slate-500 uppercase text-xs mb-1">Tone of Voice</h3>
                                <p className="text-lg font-medium text-slate-800">{identity.slogan_tone.tone_of_voice}</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-500 uppercase text-xs mb-1">Social Media Language</h3>
                                <p className="text-slate-700">{identity.social_media_style.visual_language}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900 text-white rounded-xl">
                            <Trophy className="w-8 h-8 text-yellow-400 mb-4" />
                            <h3 className="font-bold uppercase text-xs mb-2 opacity-60">Competitive Edge</h3>
                            <p className="text-lg mb-4">{identity.competitor_analysis.differentiation}</p>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-sm opacity-80">Market Gap: {identity.competitor_analysis.market_gap}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest">
                <span>© {new Date().getFullYear()} Brand Identity Guide</span>
                <span>AI Generated Strategy</span>
            </div>
        </div>
    );
}
