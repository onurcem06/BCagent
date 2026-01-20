"use client";

import { motion } from 'framer-motion';
import { BrandIdentity } from '../../lib/types';
import { ChevronRight, Layout, Zap, Shield, Star } from 'lucide-react';

export function LandingPagePreview({ identity }: { identity: BrandIdentity }) {
    const primaryColor = identity.color_palette.primary || '#3b82f6';
    const secondaryColor = identity.color_palette.secondary || '#1e293b';
    const accentColor = identity.color_palette.accent || '#8b5cf6';
    const headingFont = identity.typography.heading_font || 'Inter';
    const bodyFont = identity.typography.body_font || 'Inter';
    const radius = identity.web_ui_logic.border_radius || '8px';
    const heroImage = identity.visuals?.hero_url;

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
                    <span className="font-bold text-lg" style={{ fontFamily: headingFont }}>{identity.slogan_tone.tagline?.split(',')[0] || 'Brand'}</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <span>Features</span>
                    <span>About</span>
                    <span>Resources</span>
                    <button className="px-5 py-2 text-white font-bold transition-all hover:opacity-90 active:scale-95"
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
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-700"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                            New Version 2.0
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black leading-tight" style={{ fontFamily: headingFont }}>
                            {identity.slogan_tone.tagline || 'Elevate Your Digital Experience'}
                        </h1>
                        <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                            {identity.brand_dna.purpose || 'Our solution helps you build faster and smarter with top-tier design logic.'}
                        </p>
                        <div className="flex items-center gap-4">
                            <button className="px-8 py-4 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                style={{ backgroundColor: primaryColor, borderRadius: radius }}>
                                Get Started Free <ChevronRight className="w-4 h-4" />
                            </button>
                            <button className="px-8 py-4 font-bold border-2 border-slate-200 hover:bg-slate-100 transition-all"
                                style={{ borderRadius: radius }}>
                                View Demo
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr rounded-3xl blur-2xl opacity-20"
                            style={{ backgroundImage: `linear-gradient(to top right, ${primaryColor}, ${accentColor})` }} />
                        <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden aspect-[4/3]">
                            {heroImage ? (
                                <img src={heroImage} className="w-full h-full object-cover rounded-2xl" alt="Hero" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center rounded-2xl">
                                    <Layout className="w-12 h-12 text-slate-300" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: headingFont }}>Designed for Performance</h2>
                        <div className="h-1.5 w-20 bg-blue-500 mx-auto rounded-full" style={{ backgroundColor: primaryColor }} />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Lighting Fast", desc: "Built for speed and high-level engagement across all devices." },
                            { icon: Shield, title: "Modern Security", desc: "Your data is protected by the latest industry-standard encryption." },
                            { icon: Star, title: "Premium Design", desc: "Every pixel is crafted to reflect your brand's unique identity." }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-all space-y-4 bg-slate-50/50">
                                <div className="p-3 w-fit rounded-xl" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold" style={{ fontFamily: headingFont }}>{item.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
