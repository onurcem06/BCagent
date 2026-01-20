import { create } from 'zustand';
import { BrandIdentity, INITIAL_BRAND_IDENTITY } from './types';

interface BrandStore {
    identity: BrandIdentity;
    currentBrandId: string | null;
    updateIdentity: (identity: BrandIdentity) => void;
    updatePartialIdentity: (partial: Partial<BrandIdentity>) => void;
    setCurrentBrandId: (id: string | null) => void;
    resetIdentity: () => void;
}

const deepMerge = (target: any, source: any): any => {
    const result = { ...target };
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }
    Object.assign(result || {}, source);
    return result;
};

export const useBrandStore = create<BrandStore>((set) => ({
    identity: INITIAL_BRAND_IDENTITY,
    currentBrandId: null,
    updateIdentity: (identity) => set({ identity }),
    updatePartialIdentity: (partial) =>
        set((state) => ({
            identity: deepMerge(state.identity, partial),
        })),
    setCurrentBrandId: (id) => set({ currentBrandId: id }),
    resetIdentity: () => set({ identity: INITIAL_BRAND_IDENTITY, currentBrandId: null }),
}));
