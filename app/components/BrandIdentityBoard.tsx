"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useBrandStore } from '../lib/store';
import { Palette, Users, Type, Mic, Monitor, Share2, Target, Fingerprint, Download, Presentation, LayoutGrid, Image as ImageIcon, Edit3, FileDown, Printer, Sparkles, RefreshCcw, CheckCircle2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandIdentity } from '../lib/types';
import { useEffect, useState } from 'react';
import { MacbookPreview } from './mockups/MacbookPreview';
import { PhonePreview } from './mockups/PhonePreview';
import { BusinessCard } from './mockups/BusinessCard';
import { LandingPagePreview } from './mockups/LandingPagePreview';
import BrandGuidePDF from './BrandGuidePDF';
import { triggerCanvaAutofill } from '../lib/canvaService';
import { markAsConfirmed } from '../lib/brandsService';

// Helper Component for Font Preview
const FontPreview = ({ font, label }: { font: string; label: string }) => {
    useEffect(() => {
        if (!font || font === 'draft') return;
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}&display=swap`;
        link.rel = 'stylesheet';
        if (!document.querySelector(`link[href="${link.href}"]`)) {
            document.head.appendChild(link);
        }
    }, [font]);

    if (!font || font === 'draft') return <div className="text-xs text-slate-500 mb-1"><span className="text-slate-400">{label}:</span> draft</div>;

    return (
        <div className="mb-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">{label} — {font}</span>
            <p className="text-2xl text-white" style={{ fontFamily: font }}>Brand Identity</p>
            <p className="text-sm text-slate-400 mt-1" style={{ fontFamily: font }}>The quick brown fox jumps over the lazy dog.</p>
        </div>
    );
};

// Helper for Color Swatch
const ColorSwatch = ({ color, label }: { color: string; label: string }) => {
    if (!color || color === 'draft') return <div className="text-xs text-slate-500 mb-1"><span className="text-slate-400">{label}:</span> draft</div>;

    return (
        <div className="flex items-center gap-3 mb-2 p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div
                className="w-10 h-10 rounded-full shadow-lg border-2 border-slate-700 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
            />
            <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block">{label}</span>
                <span className="text-sm font-mono text-slate-200 select-all">{color}</span>
            </div>
        </div>
    );
};

// Helper for Web UI Preview
const WebUIPreview = ({ data, fullIdentity }: { data: any, fullIdentity?: BrandIdentity }) => {
    if (!data || (!data.button_style && !data.border_radius)) return null;

    const getRadius = (text: string) => {
        if (!text) return '4px';
        if (text.toLowerCase().includes('yuvarlak') || text.toLowerCase().includes('round')) return '12px';
        if (text.toLowerCase().includes('keskin') || text.toLowerCase().includes('sharp') || text.toLowerCase().includes('kare')) return '0px';
        if (text.includes('px')) return text.match(/\d+px/)?.[0] || '4px';
        return '4px';
    };

    const getShadow = (text: string) => {
        if (!text) return 'none';
        if (text.toLowerCase().includes('gölge') || text.toLowerCase().includes('shadow')) return '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
        if (text.toLowerCase().includes('flat') || text.toLowerCase().includes('düz')) return 'none';
        return 'none';
    };

    const radius = getRadius(data.border_radius || '');
    const shadow = getShadow(data.button_style || '');
    const primaryColor = fullIdentity?.color_palette.primary || '#333';
    const accentColor = fullIdentity?.color_palette.accent || '#888';
    const headingFont = fullIdentity?.typography.heading_font || 'sans-serif';
    const heroImageUrl = fullIdentity?.visuals?.hero_url;

    return (
        <div className="w-full h-full bg-white flex flex-col items-center justify-center relative overflow-hidden group">
            {heroImageUrl && (
                <img src={heroImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Hero Brand Visual" />
            )}
            <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at top right, ${accentColor}, transparent)` }}></div>
            <div className="text-center px-4 relative z-10 bg-white/40 backdrop-blur-[2px] p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2 text-gray-900" style={{ fontFamily: headingFont, color: primaryColor }}>
                    {fullIdentity?.slogan_tone.tagline || "Your Vision"}
                </h2>
                <div className="h-1 w-16 bg-current mx-auto mb-4 rounded-full" style={{ color: accentColor }}></div>
                <button
                    className="px-6 py-2 text-sm font-bold text-white transition-all transform hover:scale-105"
                    style={{
                        borderRadius: radius,
                        boxShadow: shadow,
                        backgroundColor: primaryColor,
                        fontFamily: headingFont
                    }}
                >
                    Get Started
                </button>
            </div>
        </div>
    );
};

// Helper for Social Media Preview
const SocialMediaPreview = ({ data, fullIdentity }: { data: any, fullIdentity?: BrandIdentity }) => {
    if (!data || (!data.visual_language && !data.grid_layout)) return null;

    const primaryColor = fullIdentity?.color_palette.primary || '#000';
    const accentColor = fullIdentity?.color_palette.accent || '#888';
    const font = fullIdentity?.typography.heading_font || 'sans-serif';
    const socialImageUrl = fullIdentity?.visuals?.social_url;

    const bgStyle = {
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`
    };

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="h-12 border-b flex items-center px-4 justify-between shrink-0">
                <span className="font-bold text-sm">Brand</span>
                <span className="text-xs text-gray-500">Posts</span>
            </div>
            <div className="flex-1 p-1 bg-gray-50 grid grid-cols-1 gap-1 overflow-auto">
                <div className="aspect-square w-full rounded relative overflow-hidden flex items-center justify-center p-4 text-center" style={bgStyle}>
                    {socialImageUrl ? (
                        <img src={socialImageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Social Brand Visual" />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-black/20"></div>
                            <p className="text-white relative z-10 text-lg font-bold drop-shadow-lg" style={{ fontFamily: font }}>
                                {fullIdentity?.slogan_tone.tagline?.split(',')[0]}
                            </p>
                        </>
                    )}
                </div>
                <div className="aspect-square w-full bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                    Image 2
                </div>
            </div>
            <div className="h-10 border-t flex justify-around items-center shrink-0">
                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
            </div>
        </div>
    );
};

const GRID_MAPPING: {
    key: keyof BrandIdentity;
    title: string;
    icon: React.ComponentType<any>;
    render: (data: any, fullIdentity?: BrandIdentity) => React.ReactNode
}[] = [
        {
            key: 'brand_dna',
            title: 'Brand DNA',
            icon: Fingerprint,
            render: (data) => data.purpose ? (
                <div className="space-y-2">
                    <div><span className="text-purple-400 text-xs font-bold uppercase">Purpose</span><p>{data.purpose}</p></div>
                    <div><span className="text-purple-400 text-xs font-bold uppercase">USP</span><p>{data.usp}</p></div>
                    <div><span className="text-purple-400 text-xs font-bold uppercase">Values</span><p>{data.values?.join(', ')}</p></div>
                </div>
            ) : null
        },
        {
            key: 'target_audience',
            title: 'Target Audience',
            icon: Users,
            render: (data) => data.demographics ? (
                <div className="space-y-2">
                    <div><span className="text-purple-400 text-xs font-bold uppercase">Archetype</span><p>{data.archetype}</p></div>
                    <div><span className="text-purple-400 text-xs font-bold uppercase">Demographics</span><p>{data.demographics}</p></div>
                    <div><span className="text-purple-400 text-xs font-bold uppercase">Psychographics</span><p>{data.psychographics}</p></div>
                </div>
            ) : null
        },
        {
            key: 'color_palette',
            title: 'Color Palette',
            icon: Palette,
            render: (data) => (
                <div>
                    <ColorSwatch color={data.primary} label="Primary" />
                    <ColorSwatch color={data.secondary} label="Secondary" />
                    <ColorSwatch color={data.accent} label="Accent" />
                    {data.rationale && <p className="text-xs text-slate-400 mt-2 border-t border-slate-800 pt-2">{data.rationale}</p>}
                </div>
            )
        },
        {
            key: 'typography',
            title: 'Typography',
            icon: Type,
            render: (data) => (
                <div>
                    <FontPreview font={data.heading_font} label="Heading Font" />
                    <FontPreview font={data.body_font} label="Body Font" />
                    {data.style_rationale && <p className="text-xs text-slate-400 mt-2 border-t border-slate-800 pt-2">{data.style_rationale}</p>}
                </div>
            )
        },
        {
            key: 'slogan_tone',
            title: 'Slogan & Tone',
            icon: Mic,
            render: (data) => data.tagline ? (
                <div className="space-y-2">
                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30 italic text-purple-200">&quot;{data.tagline}&quot;</div>
                    <div><span className="text-purple-400 text-xs font-bold uppercase">Tone</span><p>{data.tone_of_voice}</p></div>
                </div>
            ) : null
        },
        {
            key: 'web_ui_logic',
            title: 'Web UI Language',
            icon: Monitor,
            render: (data, fullIdentity) => (
                <div className="h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950/50">
                    <WebUIPreview data={data} fullIdentity={fullIdentity} />
                </div>
            )
        },
        {
            key: 'social_media_style',
            title: 'Social Media',
            icon: Share2,
            render: (data, fullIdentity) => (
                <div className="h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950/50">
                    <SocialMediaPreview data={data} fullIdentity={fullIdentity} />
                </div>
            )
        },
        {
            key: 'competitor_analysis',
            title: 'Market Gap',
            icon: Target,
            render: (data) => data.market_gap ? (
                <div className="space-y-2">
                    <div><span className="text-purple-400 text-xs font-bold uppercase">Gap</span><p>{data.market_gap}</p></div>
                    <div><span className="text-purple-400 text-xs font-bold uppercase">Differentiation</span><p>{data.differentiation}</p></div>
                </div>
            ) : null
        },
    ];

// Full-screen Modal for expanded view
const ExpandedModal = ({ isOpen, onClose, children, title }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 text-left">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-slate-900 border border-slate-700/50 w-full max-w-6xl h-full max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all text-2xl">×</button>
                        </div>
                        <div className="flex-1 overflow-auto bg-white">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function BrandIdentityBoard() {
    const { identity, updatePartialIdentity, currentBrandId, updateIdentity } = useBrandStore();
    const [viewMode, setViewMode] = useState<'strategy' | 'presentation' | 'guide'>('strategy');
    const [prompts, setPrompts] = useState<{ hero: string, social: string, logo: string } | null>(null);
    const [editingKey, setEditingKey] = useState<keyof BrandIdentity | null>(null);
    const [editData, setEditData] = useState<Record<string, unknown> | string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCanvaSyncing, setIsCanvaSyncing] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [expandedView, setExpandedView] = useState<{ key: string; title: string } | null>(null);

    const [regeneratingKey, setRegeneratingKey] = useState<keyof BrandIdentity | null>(null);

    const handleConfirm = async () => {
        if (!currentBrandId) return;
        setIsConfirming(true);
        try {
            const success = await markAsConfirmed(currentBrandId);
            if (success) {
                updateIdentity({ ...identity, status: 'confirmed' });
                alert("Smart Memory: Bu tasarım tarzı hafızaya eklendi! ✨");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleRegenerate = async (key: keyof BrandIdentity) => {
        const feedback = prompt(`${GRID_MAPPING.find(m => m.key === key)?.title} için neyi değiştirmek istersiniz? (Örn: Daha canlı renkler olsun, Fontlar daha modern olsun vb.)`);
        if (!feedback) return;

        setRegeneratingKey(key);
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: `REVISION_ACTION: Sadece "${key}" alanını şu geri bildirime göre güncelle: ${feedback}\n\nLütfen sadece güncellenmiş JSON bloğunu gönder.` }
                    ],
                    newMessage: { role: 'user', content: `Lütfen ${key} kısmını revize et.` }
                }),
            });

            if (!response.ok) throw new Error("Revizyon başarısız oldu.");

            const data = await response.json();
            const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
            const match = data.content.match(jsonRegex);
            if (match && match[1]) {
                const updatedData = JSON.parse(match[1].trim());
                updatePartialIdentity(updatedData);
            }
        } catch (error) {
            console.error("Regenerate Error:", error);
            alert("Yeniden oluşturma sırasında bir hata oluştu.");
        } finally {
            setRegeneratingKey(null);
        }
    };

    const handleCanvaSync = async () => {
        setIsCanvaSyncing(true);
        try {
            const result = await triggerCanvaAutofill(identity);
            alert(result.message);
            if (result.preview_url) {
                window.open(result.preview_url, '_blank');
            }
        } catch (error: unknown) {
            alert("Canva Sync Failed: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsCanvaSyncing(false);
        }
    };

    const handlePrint = () => {
        setViewMode('guide');
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(identity, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "brand_identity.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    useEffect(() => {
        if (identity.brand_dna.purpose) {
            setPrompts({
                hero: `Modern website landing page hero section for ${identity.brand_dna.purpose}. Industry: ${identity.metadata?.industry || 'Service'}. Colors: ${identity.color_palette.primary}.`,
                social: `Professional Instagram post for ${identity.slogan_tone.tagline}. Vibe: ${identity.social_media_style.visual_language}.`,
                logo: `Minimalist logo symbol for ${identity.brand_dna.purpose}. Symbolizes: ${identity.brand_dna.values?.[0] || 'Quality'}.`
            });
        }
    }, [identity]);

    const handleGenerateVisuals = async () => {
        if (!prompts) return;
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identity, prompts })
            });

            if (!response.ok) throw new Error("Görsel üretimi başarısız oldu.");

            const data = await response.json();

            updatePartialIdentity({
                visuals: {
                    hero_url: data.hero_url,
                    social_url: data.social_url,
                    logo_url: data.logo_url
                }
            });

            alert("Varlıklar başarıyla üretildi! Artık Sunum Modu'ndan inceleyebilirsiniz.");
        } catch (error) {
            console.error("AI Generation Error", error);
            alert("Görsel üretiminde hata oluştu.");
        } finally {
            setIsGenerating(false);
        }
    };

    const startEditing = (key: keyof BrandIdentity) => {
        setEditingKey(key);
        const data = identity[key];
        if (typeof data === 'object' && data !== null) {
            setEditData({ ...data } as Record<string, unknown>);
        } else {
            setEditData(data as string);
        }
    };

    const saveEdit = () => {
        if (editingKey && editData) {
            updatePartialIdentity({ [editingKey]: editData });
            setEditingKey(null);
            setEditData(null);
        }
    };

    const renderEditModal = () => {
        if (!editingKey || !editData) return null;
        const title = GRID_MAPPING.find(m => m.key === editingKey)?.title || editingKey;
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Edit {title}</h3>
                        <button onClick={() => setEditingKey(null)} className="text-slate-400 hover:text-white">×</button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {editData && typeof editData === 'object' && Object.keys(editData).map((field) => (
                            <div key={field} className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">{field.replace(/_/g, ' ')}</label>
                                {Array.isArray((editData as any)[field]) ? (
                                    <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                        value={((editData as any)[field] as string[]).join(', ')}
                                        onChange={(e) => setEditData({ ...(editData as object), [field]: e.target.value.split(',').map((v: string) => v.trim()) })} />
                                ) : (field.includes('color') || ['primary', 'secondary', 'accent'].includes(field)) ? (
                                    <div className="flex gap-2">
                                        <input type="color" className="h-10 w-10 bg-transparent" value={String((editData as any)[field]).startsWith('#') ? String((editData as any)[field]) : '#000000'}
                                            onChange={(e) => setEditData({ ...(editData as object), [field]: e.target.value })} />
                                        <input type="text" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                                            value={String((editData as any)[field])} onChange={(e) => setEditData({ ...(editData as object), [field]: e.target.value })} />
                                    </div>
                                ) : (
                                    <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white resize-none" rows={3}
                                        value={String((editData as any)[field])} onChange={(e) => setEditData({ ...(editData as object), [field]: e.target.value })} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="p-6 border-t border-slate-800 flex gap-3">
                        <button onClick={() => setEditingKey(null)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium">Cancel</button>
                        <button onClick={saveEdit} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium">Save Changes</button>
                    </div>
                </motion.div>
            </div>
        );
    };

    const renderPresentationMode = () => {
        const slides = [
            {
                title: 'Logo Identity',
                desc: 'Strategic brand mark designed for versatility.',
                component: (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center p-12">
                        {identity.visuals?.logo_url ? (
                            <div className="relative group">
                                <div className="absolute -inset-10 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all" />
                                <img src={identity.visuals.logo_url} className="w-64 h-64 object-contain relative z-10 drop-shadow-2xl" alt="Logo" />
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-sm">Logo not generated yet.</div>
                        )}
                    </div>
                )
            },
            {
                title: 'Website Experience',
                desc: 'Digital touchpoint mockup with your UI logic applied.',
                component: <LandingPagePreview identity={identity} />
            },
            {
                title: 'Social Media Presence',
                desc: 'Visual language consistently applied to social grids.',
                component: (
                    <div className="bg-slate-200 w-full h-full flex items-center justify-center p-4">
                        <div className="w-[300px] h-full">
                            <PhonePreview>
                                <SocialMediaPreview data={identity.social_media_style} fullIdentity={identity} />
                            </PhonePreview>
                        </div>
                    </div>
                )
            },
            {
                title: 'Professional Collateral',
                desc: 'How the brand translates to physical brand assets.',
                component: (
                    <div className="bg-slate-100 w-full h-full flex items-center justify-center p-8">
                        <BusinessCard
                            primaryColor={identity.color_palette.primary}
                            accentColor={identity.color_palette.accent}
                            font={identity.typography.heading_font}
                            logoText={identity.slogan_tone.tagline?.split(',')[0]}
                            tagline={identity.brand_dna.values?.[0] || 'Tagline'}
                        />
                    </div>
                )
            }
        ];

        return (
            <div className="relative h-[calc(100vh-180px)] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
                <div className="flex-1 relative overflow-hidden bg-slate-950">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeSlide} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="w-full h-full flex flex-col">
                            {slides[activeSlide].component}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-md p-6 border-t border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white">{slides[activeSlide].title}</h3>
                        <p className="text-slate-400 text-sm">{slides[activeSlide].desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-slate-500">{activeSlide + 1} / {slides.length}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setActiveSlide(prev => (prev > 0 ? prev - 1 : slides.length - 1))}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => setActiveSlide(prev => (prev < slides.length - 1 ? prev + 1 : 0))}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-slate-950 p-6 overflow-y-auto print:bg-white print:p-0">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-950 z-20 pb-4 border-b border-slate-800/50 print:hidden">
                <div className="flex flex-col text-left">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Branding Cockpit</h2>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Strategic Design Assistant</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button onClick={() => setViewMode('strategy')} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'strategy' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <LayoutGrid className="w-3 h-3" /> Strategy
                        </button>
                        <button onClick={() => setViewMode('presentation')} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'presentation' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <Presentation className="w-3 h-3" /> Presentation
                        </button>
                        <button onClick={() => setViewMode('guide')} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'guide' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <FileDown className="w-3 h-3" /> Brand Guide
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCanvaSync} disabled={isCanvaSyncing || !identity.brand_dna.purpose} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50">
                            {isCanvaSyncing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />} Canva Sync
                        </button>
                        {identity.status === 'confirmed' ? (
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-lg font-bold"><CheckCircle2 className="w-4 h-4" /> Confirmed</div>
                        ) : (
                            <button onClick={handleConfirm} disabled={isConfirming || !identity.brand_dna.purpose} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold border border-slate-700 disabled:opacity-50">
                                {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Finalize & Learn
                            </button>
                        )}
                        <button onClick={handleGenerateVisuals} disabled={isGenerating || !identity.brand_dna.purpose} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 uppercase tracking-tighter text-xs">
                            {isGenerating ? <Sparkles className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4" />} AI Visuals
                        </button>
                        <button onClick={handlePrint} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"><Printer className="w-4 h-4" /></button>
                        <button onClick={handleExport} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"><Download className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {viewMode === 'strategy' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    {GRID_MAPPING.map((card) => {
                        const sectionData = identity[card.key];
                        const content = card.render(sectionData, identity);
                        const hasContent = !!content;
                        const isVisual = card.key === 'web_ui_logic' || card.key === 'social_media_style';

                        return (
                            <motion.div key={card.key} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className={`relative p-5 rounded-xl border min-h-[160px] flex flex-col gap-3 group transition-all overflow-hidden ${hasContent ? 'bg-slate-900 border-purple-500/30' : 'bg-slate-900/20 border-slate-800 border-dashed opacity-50'}`}>
                                <div className="flex items-center justify-between text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <card.icon className={`w-4 h-4 ${hasContent ? 'text-purple-400' : ''}`} />
                                        <span className="text-xs font-bold uppercase tracking-wider">{card.title}</span>
                                    </div>
                                    {hasContent && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isVisual && (
                                                <button onClick={() => setExpandedView({ key: card.key, title: card.title })} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white" title="Büyüt">
                                                    <LayoutGrid className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRegenerate(card.key as keyof BrandIdentity)}
                                                disabled={regeneratingKey === card.key}
                                                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-all disabled:opacity-30"
                                                title="Yeniden Oluştur"
                                            >
                                                {regeneratingKey === card.key ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                                            </button>
                                            <button onClick={() => startEditing(card.key)} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white" title="Düzenle">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className={`flex-1 overflow-hidden ${isVisual && hasContent ? 'cursor-zoom-in hover:scale-[1.02] transition-transform' : ''}`}
                                    onClick={() => isVisual && hasContent && setExpandedView({ key: card.key, title: card.title })}>
                                    {hasContent ? (
                                        <div className="text-sm text-slate-200 leading-relaxed font-medium">{content}</div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">Awaiting AI analysis...</div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : viewMode === 'presentation' ? (
                renderPresentationMode()
            ) : (
                <div className="print:block">
                    <BrandGuidePDF />
                </div>
            )}
            {renderEditModal()}
            <ExpandedModal
                isOpen={!!expandedView}
                onClose={() => setExpandedView(null)}
                title={expandedView?.title || ''}
            >
                {expandedView?.key === 'web_ui_logic' && (
                    <div className="w-full aspect-video">
                        <LandingPagePreview identity={identity} />
                    </div>
                )}
                {expandedView?.key === 'social_media_style' && (
                    <div className="w-full flex justify-center p-8 bg-slate-100 h-full overflow-auto">
                        <div className="w-[400px]">
                            <PhonePreview>
                                <SocialMediaPreview data={identity.social_media_style} fullIdentity={identity} />
                            </PhonePreview>
                        </div>
                    </div>
                )}
            </ExpandedModal>
        </div>
    );
}

