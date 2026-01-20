"use client";

import { useEffect, useState } from 'react';
import { listAllBrands } from '@/app/lib/brandsService';
import { BrandIdentity } from '@/app/lib/types';
import Link from 'next/link';
import { LayoutGrid, Plus, Search, ExternalLink, Calendar, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
    const [brands, setBrands] = useState<(BrandIdentity & { id: string; name?: string; updatedAt?: any })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBrands = async () => {
            const data = await listAllBrands();
            setBrands(data);
            setLoading(false);
        };
        fetchBrands();
    }, []);

    const filteredBrands = brands.filter(b =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Branding Projects</h1>
                        <p className="text-slate-400">Manage and share your client brand identities</p>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Brand
                    </Link>
                </div>

                {/* Stats & Search */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <span className="text-slate-500 text-sm font-bold uppercase">Total Projects</span>
                        <p className="text-4xl font-bold mt-2">{brands.length}</p>
                    </div>
                    <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                        <Search className="w-6 h-6 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by brand name or ID..."
                            className="bg-transparent border-none focus:ring-0 text-lg w-full outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-slate-900/50 border border-slate-800 rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBrands.map((brand) => (
                            <div key={brand.id} className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all">
                                <div
                                    className="h-24 p-4 flex items-end justify-between"
                                    style={{ backgroundColor: brand.color_palette?.primary + '20' || '#1e293b' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg shadow-inner"
                                            style={{ backgroundColor: brand.color_palette?.primary }}
                                        ></div>
                                        <h3 className="font-bold truncate max-w-[150px]">{brand.name}</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-black/20 px-2 py-1 rounded">
                                        {brand.id.slice(0, 8)}
                                    </span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>Updated: {brand.updatedAt?.toDate().toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Link
                                            href={`/brand/${brand.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Client View
                                        </Link>
                                        <button className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all text-slate-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredBrands.length === 0 && !loading && (
                            <div className="col-span-full py-20 text-center text-slate-500">
                                <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No projects found. Start by creating a new brand!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
