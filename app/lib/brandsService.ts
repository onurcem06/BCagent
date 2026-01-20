import { db } from './firebase';
import { doc, setDoc, getDoc, collection, query, getDocs, orderBy, serverTimestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { BrandIdentity } from './types';

export const saveBrandIdentity = async (id: string, identity: BrandIdentity, name?: string) => {
    try {
        const brandRef = doc(db, 'brands', id);
        await setDoc(brandRef, {
            ...identity,
            id,
            name: name || identity.slogan_tone.tagline?.split(',')[0] || 'Untitled Brand',
            updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving brand identity:", error);
        return false;
    }
};

export const getBrandIdentity = async (id: string): Promise<BrandIdentity | null> => {
    try {
        const brandRef = doc(db, 'brands', id);
        const docSnap = await getDoc(brandRef);
        if (docSnap.exists()) {
            return docSnap.data() as BrandIdentity;
        }
        return null;
    } catch (error) {
        console.error("Error fetching brand identity:", error);
        return null;
    }
};

export const listAllBrands = async () => {
    try {
        const brandsRef = collection(db, 'brands');
        const q = query(brandsRef, orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error listing brands:", error);
        return [];
    }
};

export const markAsConfirmed = async (id: string) => {
    try {
        const brandRef = doc(db, 'brands', id);
        await setDoc(brandRef, { status: 'confirmed' }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error confirming brand:", error);
        return false;
    }
};

export const getHistorySummaryForAI = async () => {
    try {
        const brandsRef = collection(db, 'brands');
        // Get last 5 confirmed projects
        const q = query(brandsRef, orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const confirmedBrands = querySnapshot.docs
            .map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data())
            .filter((b: any) => b.status === 'confirmed')
            .slice(0, 5);

        if (confirmedBrands.length === 0) return "";

        let summary = "\n### GEÇMİŞ BAŞARILI PROJELER VE TERCİHLERİNİZ:\n";
        confirmedBrands.forEach((b: any, i: number) => {
            summary += `${i + 1}. MARK: ${b.name}\n`;
            summary += `   - Sektör: ${b.metadata?.industry || 'Genel'}\n`;
            summary += `   - DNA: ${b.brand_dna.purpose}\n`;
            summary += `   - Stil Kararı: ${b.color_palette.primary} rengi ve ${b.typography.heading_font} fontu tercih edildi.\n`;
        });
        summary += "\nBu geçmiş tercihlere dayanarak, kullanıcının estetik dilini anla ve yeni önerilerini bu kalite standardında sun.\n";
        return summary;
    } catch (error) {
        console.error("Error fetching history for AI:", error);
        return "";
    }
};
