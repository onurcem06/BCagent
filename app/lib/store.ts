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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepMerge = (target: any, source: any): any => {
    const result = { ...target };
    for (const key in source) {
        if (source[key] != null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (key in target && target[key] != null && typeof target[key] === 'object') {
                result[key] = deepMerge(target[key], source[key]);
            } else {
                result[key] = { ...source[key] };
            }
        } else {
            result[key] = source[key];
        }
    }
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
