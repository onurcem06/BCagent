"use client";

import { useState, useEffect } from 'react';
import { Folder, Plus, Trash2, History, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { listAllBrands, getBrandIdentity, deleteBrand } from '../lib/brandsService';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useBrandStore } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrandLibrary({ onClose }: { onClose?: () => void }) {
    const { setCurrentBrandId, updateIdentity, resetIdentity, currentBrandId } = useBrandStore();
    const [brands, setBrands] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!db) return;

        setIsLoading(true);
        const brandsRef = collection(db, 'brands');
        const q = query(brandsRef, orderBy('updatedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allBrands = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as any));
            // Filter out soft-deleted brands
            setBrands(allBrands.filter(b => !b.deleted));
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to fetch brands", error);
            // Fallback for missing index: try without order
            const simpleQ = query(brandsRef);
            onSnapshot(simpleQ, (snapshot) => {
                const allBrands = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as any));
                setBrands(allBrands.filter(b => !b.deleted));
                setIsLoading(false);
            });
        });

        return () => unsubscribe();
    }, []);

    const handleSelectBrand = async (id: string) => {
        const identity = await getBrandIdentity(id);
        if (identity) {
            setCurrentBrandId(id);
            updateIdentity(identity);
            // Restore the master report to the store visuals
            if (identity.master_report_content) {
                useBrandStore.getState().setLatestReport(identity.master_report_content);
            }
            if (onClose) onClose();
        }
    };

    const handleNewBrand = () => {
        const confirmNew = confirm("Yeni bir markaya başlamak üzeresiniz. Mevcut çalışmanız kaydedildi. Devam etmek istiyor musunuz?");
        if (confirmNew) {
            resetIdentity();
            const newId = uuidv4();
            setCurrentBrandId(newId);
            if (onClose) onClose();
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        const confirmDelete = confirm(`"${name}" markasını silmek istediğinize emin misiniz?`);
        if (confirmDelete) {
            const success = await deleteBrand(id);
            if (success) {
                setBrands(brands.filter(b => b.id !== id));
                if (currentBrandId === id) {
                    resetIdentity();
                }
            }
        }
    };

    const filteredBrands = brands.filter(b =>
        b.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.brand_dna?.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 shadow-2xl text-left">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-bold text-white tracking-tight text-left">Marka Kütüphanesi</h2>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
                            title="Kapat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleNewBrand}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 active:scale-95 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Marka Oluştur
                    </button>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Marka Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500/50" />
                        <span className="text-xs font-medium uppercase tracking-widest">Yükleniyor</span>
                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <Folder className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 text-sm font-medium">Henüz kayıtlı bir marka bulunamadı.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Kayıtlı Çalışmalar</p>
                        {filteredBrands.map((brand) => (
                            <motion.div
                                key={brand.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${currentBrandId === brand.id
                                    ? 'bg-purple-600/10 border-purple-500/50 shadow-lg shadow-purple-900/10'
                                    : 'bg-slate-800/30 border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700'
                                    }`}
                                onClick={() => handleSelectBrand(brand.id)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-sm truncate ${currentBrandId === brand.id ? 'text-purple-400' : 'text-slate-200'}`}>
                                            {brand.brand_name || brand.name || "Adsız Marka"}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-medium italic">
                                            {brand.brand_dna?.purpose || "Açıklama yok"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleDelete(e, brand.id, brand.name)}
                                            className="p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <ChevronRight className="w-4 h-4 text-slate-600" />
                                    </div>
                                </div>

                                {brand.status === 'confirmed' && (
                                    <div className="mt-2 flex items-center gap-x-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[9px] font-bold text-green-500/80 uppercase">Tamamlandı</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-[10px] text-slate-600 font-bold uppercase tracking-tighter text-center">
                V2.1 - Smart History Engine
            </div>
        </div>
    );
}
