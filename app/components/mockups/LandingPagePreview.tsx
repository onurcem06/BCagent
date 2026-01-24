"use client";

import { motion } from 'framer-motion';
import { BrandIdentity } from '../../lib/types';
import { ChevronRight, Layout, Zap, Shield, Star } from 'lucide-react';

export function LandingPagePreview({ identity }: { identity: BrandIdentity }) {
    const primaryColor = identity.color_palette.primary || '#3b82f6';
    const accentColor = identity.color_palette.accent || '#8b5cf6';
    const headingFont = identity.typography.heading_font || 'Inter';
    const bodyFont = identity.typography.body_font || 'Inter';
    const radius = identity.web_ui_logic.border_radius || '12px';
    const layoutStyle = identity.web_ui_logic.layout_style || 'SaaS';
    const heroImage = identity.visuals?.hero_url;

    // Layout Styles
    if (layoutStyle === 'Minimalist') {
        return (
            <div className="w-full bg-white text-slate-900 overflow-auto h-full scrollbar-hide" style={{ fontFamily: bodyFont }}>
                <nav className="p-8 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
                    <span className="text-xl font-black tracking-tighter" style={{ fontFamily: headingFont }}>
                        {identity.visuals?.logo_url ? <img src={identity.visuals.logo_url} className="h-6 w-auto" alt="Logo" /> : (identity.brand_name || identity.slogan_tone.tagline?.split(',')[0] || 'BRAND')}
                    </span>
                    <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        <span className="hover:text-black cursor-pointer transition-colors">Selection</span>
                        <span className="hover:text-black cursor-pointer transition-colors">Archive</span>
                        <span className="text-black cursor-pointer border-b-2 border-black">Journal</span>
                    </div>
                </nav>
                <section className="px-12 py-32 max-w-7xl mx-auto">
                    <div className="grid grid-cols-12 gap-12">
                        <div className="col-span-12 md:col-span-7 space-y-12">
                            <motion.h1
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-7xl md:text-9xl font-black leading-[0.85] tracking-tightest"
                                style={{ fontFamily: headingFont }}
                            >
                                {identity.slogan_tone.tagline || 'PURE DESIGN.'}
                            </motion.h1>
                            <p className="text-2xl text-slate-400 max-w-xl font-medium leading-relaxed">
                                {identity.brand_dna.purpose}
                            </p>
                        </div>
                        <div className="col-span-12 md:col-span-5 aspect-[3/4] bg-slate-100 overflow-hidden" style={{ borderRadius: radius }}>
                            {heroImage && <img src={heroImage} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Hero" />}
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (layoutStyle === 'Immersive') {
        return (
            <div className="w-full bg-black text-white overflow-auto h-full scrollbar-hide relative" style={{ fontFamily: bodyFont }}>
                {heroImage && (
                    <div className="absolute inset-0 z-0">
                        <img src={heroImage} className="w-full h-full object-cover opacity-60" alt="Hero Background" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
                    </div>
                )}
                <div className="relative z-10 min-h-full flex flex-col">
                    <nav className="p-10 flex justify-center">
                        <div className="px-8 py-3 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 flex gap-10 items-center text-xs font-bold uppercase tracking-widest">
                            <span className="text-white/60 hover:text-white pointer-cursor">Experience</span>
                            <span className="text-white/60 hover:text-white pointer-cursor">Vision</span>
                            <div className="w-10 h-10 -mx-4 bg-white rounded-full flex items-center justify-center p-2">
                                {identity.visuals?.logo_url ? <img src={identity.visuals.logo_url} className="w-full h-full object-contain" alt="Brand Logo" /> : <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                            <span className="text-white/60 hover:text-white pointer-cursor">Utility</span>
                            <span className="text-white/60 hover:text-white pointer-cursor">Contact</span>
                        </div>
                    </nav>
                    <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
                        <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2 }}>
                            <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter mb-8 leading-none" style={{ fontFamily: headingFont }}>
                                {identity.slogan_tone.tagline?.toUpperCase() || 'IMPACT'}
                            </h1>
                            <button className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] overflow-hidden group relative" style={{ borderRadius: radius }}>
                                <span className="relative z-10">Discover More</span>
                                <div className="absolute inset-0 bg-slate-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>
                        </motion.div>
                    </main>
                </div>
            </div>
        );
    }

    if (layoutStyle === 'Corporate') {
        return (
            <div className="w-full bg-slate-50 text-slate-900 overflow-auto h-full scrollbar-hide" style={{ fontFamily: bodyFont }}>
                <nav className="p-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        {identity.visuals?.logo_url ? <img src={identity.visuals.logo_url} className="h-8 w-auto" alt="Brand Logo" /> : <div className="w-8 h-8 rounded" style={{ backgroundColor: primaryColor }} />}
                        <span className="font-bold text-lg uppercase tracking-tight" style={{ fontFamily: headingFont }}>{identity.brand_name || identity.slogan_tone.tagline?.split(',')[0] || 'CORPORATION'}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex gap-8 text-xs font-bold uppercase text-slate-500">
                            <span>Services</span>
                            <span>About</span>
                            <span>Investors</span>
                        </div>
                        <button className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-all">Work with us</button>
                    </div>
                </nav>
                <section className="px-12 py-24 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Shield className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Industry Leader</span>
                            </div>
                            <h1 className="text-6xl font-black text-slate-900 leading-tight" style={{ fontFamily: headingFont }}>
                                {identity.slogan_tone.tagline || 'Excellence in every detail.'}
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                {identity.brand_dna.purpose}
                            </p>
                            <div className="flex items-center gap-12 pt-4 border-t border-slate-200">
                                <div><p className="text-3xl font-black text-slate-900">50+</p><p className="text-xs font-bold text-slate-400 uppercase">Experts</p></div>
                                <div><p className="text-3xl font-black text-slate-900">12k</p><p className="text-xs font-bold text-slate-400 uppercase">Clients</p></div>
                                <div><p className="text-3xl font-black text-slate-900">20y</p><p className="text-xs font-bold text-slate-400 uppercase">Legacy</p></div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-slate-200 rounded-[2rem] transform -rotate-1 group-hover:rotate-0 transition-transform duration-500" />
                            <div className="relative aspect-[4/5] bg-slate-300 rounded-[1.5rem] overflow-hidden shadow-2xl">
                                {heroImage ? (
                                    <img src={heroImage} className="w-full h-full object-cover" alt="Hero Section" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white"><Star className="w-12 h-12 text-slate-200" /></div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
    return (
        <div className="w-full bg-slate-50 text-slate-900 overflow-auto h-full scrollbar-hide" style={{ fontFamily: bodyFont }}>
            {/* Navigation */}
            <nav className="p-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    {identity.visuals?.logo_url ? (
                        <img src={identity.visuals.logo_url} className="w-8 h-8 object-contain" alt="Logo" />
                    ) : (
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
                    )}
                    <span className="font-bold text-lg" style={{ fontFamily: headingFont }}>{identity.brand_name || identity.slogan_tone.tagline?.split(',')[0] || 'Brand'}</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <span className="hover:text-purple-600 transition-colors pointer-cursor">Features</span>
                    <span className="hover:text-purple-600 transition-colors pointer-cursor">About</span>
                    <span className="hover:text-purple-600 transition-colors pointer-cursor">Resources</span>
                    <button className="px-5 py-2 text-white font-bold transition-all hover:opacity-90 active:scale-95 shadow-xl shadow-blue-500/20"
                        style={{ backgroundColor: primaryColor, borderRadius: radius }}>
                        Launch App
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 px-8 overflow-hidden min-h-[600px] flex items-center">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full bg-blue-100 text-blue-700"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                            Verified Concept v2
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black leading-[1.1]" style={{ fontFamily: headingFont }}>
                            {identity.slogan_tone.tagline || 'Elevate Your Digital Experience'}
                        </h1>
                        <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                            {identity.brand_dna.purpose || 'Our solution helps you build faster and smarter with top-tier design logic.'}
                        </p>
                        <div className="flex items-center gap-4">
                            <button className="px-8 py-4 text-white font-bold flex items-center gap-2 shadow-2xl hover:shadow-purple-500/30 transition-all active:scale-95"
                                style={{ backgroundColor: primaryColor, borderRadius: radius }}>
                                Get Started Free <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr rounded-3xl blur-3xl opacity-30"
                            style={{ backgroundImage: `linear-gradient(to top right, ${primaryColor}, ${accentColor})` }} />
                        <div className="relative bg-white/50 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden aspect-[4/3]">
                            {heroImage ? (
                                <img src={heroImage} className="w-full h-full object-cover rounded-[2rem] shadow-inner" alt="Hero" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center rounded-[2rem]">
                                    <Layout className="w-12 h-12 text-slate-300" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
